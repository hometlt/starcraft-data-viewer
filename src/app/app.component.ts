import {Component, OnInit} from '@angular/core';
import {SCDataService} from "./sc-data.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit{
  title = 'app-sc';
  filters: any;
  activeCatalog: any;
  DA: any;
  raceFiltersActive: string[] = [];
  unitTypeFilersActive: SCUnitType[] = [];
  units: SCUnit[];
  activeUnit: SCUnit | null = null
  tooltipOffset: {x: number, y: number}
  selected: SCUnit | null;
  constructor(private scdata: SCDataService) {
  }
  select(unit: SCUnit){
    this.scdata.unit(unit.Id).subscribe(unit => this.selected = unit)
  }
  deselect(){
    this.selected = null;
  }
  hideTooltip(){
    this.activeUnit = null
  }
  setTooltip(unit: SCUnit, event: MouseEvent){
    let target = event!.target as HTMLElement
    this.activeUnit = unit;
    this.tooltipOffset = {x: target.offsetLeft - 20, y:target.offsetTop + 45}
  }
  ngOnInit() {
    this.scdata.units().subscribe(units => this.units = units)
  }
  isFiltered(instance: any){
    let unitType = instance.Type

    if(['Unit','Structure','Hero'].includes(unitType)) {
      if (!this.unitTypeFilersActive.includes(unitType)) {
        return false;
      }
    }
    else{
      if (!this.unitTypeFilersActive.includes("Other")) {
        return false;
      }
    }
    if(!this.raceFiltersActive.includes("all")) {
      // let race = sc2race(instance,this.DO)
      // if(race){
      //   if (!this.raceFiltersActive.includes(race.id)){
      //     return false
      //   }
      // }
      // else {
      //   if (!this.raceFiltersActive.includes("none")){
      //     return false
      //   }
      // }
    }
    return true
  }
  setActiveCatalog(category: string){
    this.activeCatalog = category
  }
  updateRaceCounters(){
    if(this.raceFiltersActive.length && this.unitTypeFilersActive.length) {
      for (let catalog of this.DA.catalogs) {
        let counter = 0
        for (let instance of this.DA[catalog.id]) {
          if(this.isFiltered(instance))counter++
        }
        catalog.count = counter
      }
    }
  }
  toggleUnitTypeFilter(unitType: any){
    if(!this.unitTypeFilersActive.includes(unitType.ID)){
      this.unitTypeFilersActive.push(unitType.ID)
    }
    else{
      this.unitTypeFilersActive.splice(this.unitTypeFilersActive.indexOf(unitType.ID),1)
    }
    this.updateRaceCounters()
  }
  toggleRaceFilter(race: any){
    if(!this.raceFiltersActive.includes(race.ID)){
      this.raceFiltersActive.push(race.ID)
    }
    else{
      this.raceFiltersActive.splice(this.raceFiltersActive.indexOf(race.ID),1)
    }
    this.updateRaceCounters()
  }
  isOnScreen(instance: any){
    return true
  }
  getEditorData(data: any){
    // let {DA} = fromXMLObject(data)
    // this.DA = DA;
    // this.activeCatalog =  "";
    this.updateRaceCounters()
  }
  data () {

    // return reactive({
    //   isRaceFiltered: {},
    //   unitTypeFilersActive: ["Structure","Unit","Hero","Other"],
    //   raceFiltersActive: ["all"],
    //   activeCatalog: null,
    //   sortable: {order: "index", sort: "asc"},
    //   techStructure: null ,
    //   replacementStructure: null ,
    //   DA: null,
    //   DO: null
    // })
  }
}
