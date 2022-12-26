import fs from 'fs'

import {SCMod} from '../../data-parser/src/sc-mod.js';
let images = fs.readdirSync('./icons').map(file => file.replace('.png',''))

let mod = new SCMod()
await mod.read('./data')

// mod.directory('../../data-input')
// await mod.read('0.Core', '1.Liberty', '2.Liberty Campaign', '4.Swarm', '5.Swarm Campaign', '7.Void', '8.Void Campaign')
// await mod.read('0.Core', '1.Liberty', '4.Swarm', '7.Void')

//
// mod.directory('../../../Mods/all-races-mods')
// await mod.read('VoidBalance','Campaign','Scion','UED','Hybrids','Dragons','UPL','UPLCampaign','UPLBalance')
//
// mod.directory('../../../Mods/all-races-core')
// await mod.read('Core')

mod.cache.abilcmd = {}
mod.catalogs.abilcmd = []
let abilcmds = mod.catalogs.abil.filter(entry => entry.InfoArray).reduce((prev,ability)=> {
    prev.push(...Object.entries(ability.InfoArray).map(([cmd,info]) => ({id: ability.id +"," + cmd, abil: ability.id, cmd})))
    return prev
},[])
for(let abilcmd of abilcmds){
  mod.cache.abilcmd[abilcmd.id] = {
    id: abilcmd.id,
    abil: abilcmd.abil,
    cmd: abilcmd.cmd
  }
  mod.catalogs.abilcmd.push(abilcmd)
}

for(let entity of mod.entities){
  if(entity.EditorCategories){
    entity.EditorCategories.split(",").map(cat => cat.split(":")).forEach(([category,value]) => {
      entity["$"+ category] = value
    })
  }
}

function parseField(field){
  let [match, resultFieldName, query] = field.match(/([@\w]+)(?::(.*))?/)
  return {match,resultFieldName, query}
}
/*
export function readStructureRecoursve(data, structure){
  for(let field in structure) {
    let {resultFieldName} = parseField(field)

    if(data[resultFieldName]){

      if(SC2TypesPostProseccsing[structure[field]]){
        data[resultFieldName] = SC2TypesPostProseccsing[structure[field]](data[resultFieldName],data,structure[field])
        if(data[resultFieldName] === null){
          delete data[resultFieldName]
        }
      }
      else if(structure[field].constructor === Object){
        for (let instanceId in data[resultFieldName]) {
          readStructureRecoursve(data[resultFieldName][instanceId],structure[field])
        }
      }
      else if(structure[field].constructor === Array ){
        //converting to Object
        {
          let resultObject = {};
          for(let i in data[resultFieldName]){
            let item = data[resultFieldName][i]
            let index = item.index
            if(index !== undefined){
              delete item.index
              if(item.removed){
                delete resultObject[index]
                continue
              }
            }
            else{
              index = 0
              while(resultObject[index])index++
            }
            if(resultObject[index]){
              objectAssignDeep(resultObject[index],item)
            }
            else{
              resultObject[index] = item
            }
          }
          data[resultFieldName] = Object.values(resultObject)
        }
        for (let instance of data[resultFieldName]) {
          readStructureRecoursve(instance,structure[field])
        }
      }
    }
  }
}
*/
for(let upgrade of mod.catalogs.upgrade) {
  if(upgrade.AffectedUnitArray){
    upgrade.AffectedUnitArray = upgrade.AffectedUnitArray.map(x => x.value)
  }
}


export function getImagesList(){
  return images
}

function gameText(id){
    let result = mod.locales.enUS.GameStrings[id]
    if(!result)return ""
    // dd<d ref="Behavior,ZerglingArmorShredTarget,Duration" precision="2"/>dd
    // dd<d ref="Behavior,ZerglingArmorShredTarget,Duration"/>dd
    result = result
        .replace(/<n\/>/g,"<br/>")
        .replace(/<c val="(\w+)">/g,`<span style="color: #$1">`)
        .replace(/<\/c>/g,"</span>")
        .replace(/<d\s+(?:stringref)="(\w+),(\w+),(\w+)"\s*\/>/g, (_,catalog,entity,field)=>{
            return mod.cache[catalog.toLowerCase()]?.[entity]?.[field];
        })
        .replace(/<d\s+(?:time|ref)="(.+?)(?=")"(?:\s+precision="(\d+)")?\s*\/>/g, (_,ref,precision)=>{
          ref = ref.replace(/(\w+),(\w+),(\w+)([\.\w\[\]]+)*/g,(_,catalog,entity,field,xx)=>{

            try{
              let value = mod.cache[catalog.toLowerCase()]?.[entity]?.[field];
              if(!value)return 0;
              if(xx){
                value = eval('value'+xx.replace(/\[/g,'[\"').replace(/]/g,"\"\]"))
              }
              if(value === undefined){
                console.log('wrong value? ' + xx)
                return ''
              }
              value = value.value || value
              return +value


            }
            catch(e){
              return ''
            }

          })
          let value = eval(ref)
          value = precision ?  value.toFixed(precision) : Math.round(value)
          return `<b>${value}</b>`
        })

    return result
}

function quickInfo(catalog,id){
    let entity = mod.cache[catalog][id] || {}
    if(!entity) return null;

    switch(catalog){
        case "unit":
            return {
                Id: id,
                Icon: entity.UnitIcon,
                Description: gameText(entity.Description || `Button/Tooltip/${id}`),
                Name: gameText(entity.Name || `${catalog}/Name/${id}`)
            }
        case "weapon":
            return {
                Id: id,
                Icon: entity.Icon,
                Name: gameText(entity.Name || `Weapon/Name/${id}`),
                DisplayEffect: entity.DisplayEffect && mod.cache.effect[entity.DisplayEffect],
                DisplayAttackCount: entity.DisplayAttackCount,
                TargetFilters: entity.TargetFilters?.split(";")[0].replace(",Visible","").replace("Visible",""),
                Range: entity.Range || entity.MinScanRange,
                Period: entity.Period,
            }
        case "upgrade":
            return {
                Id: id,
                Icon: entity.Icon,
                Name: gameText(entity.Name || `Upgrade/Name/${id}`)
            }
        case "ability":
            // if(mod.cache.button[entity.button]){
            //     return quickInfo("Button",entity.button)
            // }
            return {
                Id: id,
                Icon: entity.Icon,
                Name: gameText(entity.Name  || `Abil/Name/${id}`)
            }
        case "button":
            return {
                Icon: entity.Icon,
                Description: gameText(entity.Tooltip || `${catalog}/Tooltip/${id}`),
                Name: gameText(entity.Name  || `${catalog}/Name/${id}`)
            }
        case "Behavior":
            return {
                Id: id,
                Icon: entity.Icon,
                Description: gameText(entity.Tooltip || `Behavior/Tooltip/${id}`),
                Name: gameText(entity.Name  || `Behavior/Name/${id}`) || id
            }
        default:
            return {
                Id: id,
                Icon: entity.Icon,
                Description: gameText(entity.Description || `${catalog}/Tooltip/${id}`),
                Name: gameText(entity.Name  || `${catalog}/Name/${id}`)
            }
    }
}

function produceAbilities(unitname){
    return cache.abilcmds.filter(entry => entry.info.Unit?.includes(unitname)).map(abilcmd => abilcmd.id)
}

function producingUnits (unitname){
    let abilCmds = produceAbilities(unitname).map(abilcmd => abilcmd.id)
    return cache.units.filter(entry => entry.unit.CardLayouts?.find(card => card.AbilCmd && abilCmds.includes(card.AbilCmd))).map(unit => unit.id)
}

function producingRequirements (unitname){




  let abilCmds = mod.catalogs.abilcmd.filter(entry => {
    let unit = mod.cache.abil[entry.abil].InfoArray[entry.cmd].Unit
    if(!unit)return false;
    if(unit.constructor !== Array)    unit = [unit]
    return unit.includes(unitname)
  })
    let abilCmdsIds = abilCmds.map(abilcmd => abilcmd.id)

    let requirements = abilCmds.map(entry => mod.cache.abil[entry.abil].InfoArray[entry.cmd].Requirements).filter(Boolean)
        .map(req => mod.cache.requirement[req]?.Node).filter(Boolean)
        .map(reqNode => mod.cache.requirementnode[reqNode]).filter(Boolean)

    let reqUnitsAliases = requirements.map(req => req.Unit).filter(Boolean)
    let reqUpgradeAliases = requirements.map(req => req.Upgrade).filter(Boolean)

    let requiredUnits = mod.catalogs.unit.filter(entry => reqUnitsAliases.includes(entry.TechAliasArray) || reqUnitsAliases.includes(entry.id) ).map(unit => unit.id)
    let requiredUpgrades = mod.catalogs.upgrade.filter(entry => reqUpgradeAliases.includes(entry.TechAliasArray) || reqUpgradeAliases.includes(entry.id) ).map(unit => unit.id)
    let producingUnits = mod.catalogs.unit
      .filter(entry =>entry.CardLayouts?.reduce((result,card) => {
          if(card.LayoutButtons){
            for(let button of card.LayoutButtons) {
              let abilcmd = mod.cache.abilcmd[button.AbilCmd]
              if (abilcmd && abilCmdsIds.includes(abilcmd)) {
                result.push(...info.Unit)
              }
            }
          }
          return result
        },[]).length)
      .map(unit => unit.id)









    return {requiredUnits,requiredUpgrades,producingUnits}
}



export function getUnits(params){
    let units = mod.catalogs.unit
        .filter(unit => { return unit.Race &&
                 !["Orc","Human","Other","Naga","Critters","NightElf","Creeps","Undead"].includes(unit.Race) &&
                 unit.$ObjectFamily === "Melee"

        })
        .map(entry => quickInfo("unit",entry.id))
    console.log(units.length)
    return units;
}

export function getCommands(unitname){
    let unit = mod.cache.unit[unitname]
    return unit.CardLayouts?.reduce((result,card) => {
      for(let button of card.LayoutButtons) {
        if(button.AbilCmd){

          let [abil,cmd] = button.AbilCmd.split(",")
          let ability = mod.cache.abil[abil]
          if (ability) {
            let face = ability.InfoArray?.[cmd]?.Button || ability.CmdButtonArray?.[cmd]?.DefaultButtonFace
            if (face) {
              result.push(({...quickInfo("button",face)}))
            }
          }
        }
      }
      return result
    },[])
}

export function getUnitData(unitId){
    let unit = mod.cache.unit[unitId]
    if(!unit) return null

    let upgrades = mod.catalogs.upgrade.filter(entry => entry.AffectedUnitArray?.includes(unitId)).map(entry => entry.id)

    let trainings = unit.CardLayouts?.reduce((result,card) => {
      for(let button of card.LayoutButtons) {
        let abilcmd = mod.cache.abilcmd[button.AbilCmd]
        if (abilcmd) {
          let info = mod.cache.abil[abilcmd.abil].InfoArray[abilcmd.cmd];
          if (info?.Unit) {
            result.push(...info.Unit)
          }
        }
      }
      return result
    },[])

    let {requiredUnits,requiredUpgrades,producingUnits} = producingRequirements(unitId)


    let result = {
        ...quickInfo("unit",unitId),
        Race: unit.Race,
        ObjectFamily: unit.ObjectFamily,
        ObjectType: unit.ObjectType,
        CargoSize: unit.CargoSize,
        Sight: unit.Sight,
        Food: unit.Food,
        Speed: unit.Speed,
        GlossaryPriority: unit.GlossaryPriority,
        CostResource: unit.CostResource,
        Attributes: Object.keys(unit.Attributes),
        EnergyMax: unit.EnergyMax,
        LifeMax: unit.LifeMax,
        LifeArmor: unit.LifeArmor,
        LifeArmorIcon: unit.LifeArmorIcon,
        ShieldArmorIcon: unit.ShieldArmorIcon,
        ShieldsMax: unit.ShieldsMax,
        ShieldArmor: unit.ShieldArmor,
        Commands: getCommands(unitId),
        Behaviors: unit.BehaviorArray?.map(x=>quickInfo("behavior",x.Link)),
        Weapons:  unit.WeaponArray?.map(x=>quickInfo("weapon",x.Link)),
        Strengths: unit.GlossaryStrongArray?.map(x=>quickInfo("unit",x)),
        Weaknesses: unit.GlossaryWeakArray?.map(x=>quickInfo("unit",x)),
        Abilities: unit.AbilArray?.map(x=>quickInfo("abil",x.Link)),
        Upgrades: upgrades.map(x=>quickInfo("upgrade",x)),
        Producers: producingUnits.map(x=>quickInfo("unit",x)),
        Production: trainings.map(x=>quickInfo("unit",x)),
        Requirements: [
            ...requiredUnits.map(x=>quickInfo("unit",x)),
            ...requiredUpgrades.map(x=>quickInfo("upgrade",x))
        ]
    }
    return result
}
