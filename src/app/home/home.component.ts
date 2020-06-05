import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';
import { Statewise, CasesTimeSeries} from '../services/covidinterface.service';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {  AfterViewInit} from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

import { Chart } from 'chart.js';  
import { red } from 'color-name';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})


export class HomeComponent implements OnInit, AfterViewInit {
  country: Statewise;
  timeSeriesStates: CasesTimeSeries[];
  states: Statewise[];
  subscription: Subscription;
  statusText: string;
  displayedColumns: string[] = ['State','Recovered','Confirmed','Deaths','Active'];
  data = new MatTableDataSource(null);
  searchText;
  loading : boolean = true;
  dailyConfirmedCases = [];
  dailyDeceasedCases = [];
  dailyRecoveredCases = [];
  linechartConfirmed: any;
  linechartRecovered: any;
  linechartDeceased: any;
  dateData = [];
  constructor(private httpService:HttpService,private router:Router) { }


  ngOnInit(): void {

    console.log(this.loading)
    this.httpService.getfullData().subscribe(response => {
      this.timeSeriesStates = response.cases_time_series;
      this.loadGraphData();
    });

    this.subscription = timer(0, 10000).pipe(switchMap(() => this.httpService.getfullData())).subscribe(response => 
      {
        this.country = response.statewise[0];
        this.states =response.statewise.slice(1);
        this.data = new MatTableDataSource(this.states);
        this.loading = false;
    
      });    
    
    }


  /**To load the data into Graphs */  
  loadGraphData() : void {
     this.timeSeriesStates.forEach(res => {
       this.dailyConfirmedCases.push(res.dailyconfirmed);
       this.dailyRecoveredCases.push(res.dailyrecovered);
       this.dailyDeceasedCases.push(res.dailydeceased);
       this.dateData.push(res.date);
       
     });
     this.linechartConfirmed = new Chart('covidCharts', {  
      type: 'line',  
      data: {  
        labels: this.dateData,  
        datasets: [  
          {  
            data: this.dailyConfirmedCases,  
            label: 'Confirmed',
            borderColor: "red"
          },
          {
            data: this.dailyRecoveredCases,  
            label: 'Recovered',
           borderColor: "green"
           },
           {
            data: this.dailyDeceasedCases,  
            label: 'Deceased',
            borderColor: "#0000FF"
           }     
        ]  
      },  
      options: {  
        legend: {  
          display: true,
        },  
        scales: {  
          xAxes: [{  
            display: true  
          }],  
          yAxes: [{  
            display: true  
          }],  
        }  
      }  
    });  

  }


 


  ngAfterViewInit(): void {
   this.data = new MatTableDataSource(this.states);

  }


  rowRedirect(row, Event: Event) : void {
    sessionStorage.setItem("rowData", JSON.stringify(row));
    this.router.navigate(['/state-wise/stateWise']);
  }


  applyFilter(event: Event) : void {
      this.data.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }


}


