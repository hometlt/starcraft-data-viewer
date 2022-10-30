import {Component, Input, OnInit} from '@angular/core';
import {environment} from "../../environments/environment";

@Component({
  selector: 'sc-unit',
  templateUrl: './sc-unit.component.html',
  styleUrls: ['./sc-unit.component.less']
})
export class ScUnitComponent implements OnInit {

  constructor() { }

  @Input()
  full: boolean =false;

  ngOnInit(): void {
  }

  @Input()
  unit: SCUnit
  imagesRoot: string = environment.imagesRoot
  dataRoot: string = environment.dataRoot

  debug(x:any){
    return JSON.stringify(x)
  }
  energyStyles(value: number){
    return {'background-size':  Math.ceil(25 / ((value)        / 32)) + 'px 3px' }
  }
  vitalityStyles(value: number){
    return {'background-size':  Math.ceil(48 / ((value)        / 32)) + 'px 3px' }
  }
  vitalityMoreStyles(value: number){
    return {'background-size':  Math.ceil(48 / ((value - 1000) / 32)) + 'px 3px, 2px 3px, 50px 3px'}
  }
  vitalityStylesEvenMoreStyles(value: number){
    return {'background-size':  Math.max(2,Math.ceil(48 / ((value - 2000) / 32))) + 'px 2px, 2px 4px, 50px 2px'}
  }
  switchIcon(layoutSlot: any){
    if(layoutSlot?.length > 1){
      layoutSlot.unshift(layoutSlot.pop())
    }
  }

}
