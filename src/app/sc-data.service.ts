import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../environments/environment";



@Injectable({
  providedIn: 'root'
})
export class SCDataService {

  constructor(private http: HttpClient) { }

  units() : Observable<SCUnit[]> {
    return this.http.get(environment.dataRoot + 'units') as Observable<SCUnit[]>
  }
  unit(unit:String) : Observable<SCUnit> {
    return this.http.get(environment.dataRoot + `unit/${unit}`) as Observable<SCUnit>
  }
}
