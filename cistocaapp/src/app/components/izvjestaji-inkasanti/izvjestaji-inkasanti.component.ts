import { Component, OnInit } from '@angular/core';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-izvjestaji-inkasanti',
  templateUrl: './izvjestaji-inkasanti.component.html',
  styleUrls: ['./izvjestaji-inkasanti.component.css']
})
export class IzvjestajiInkasantiComponent implements OnInit {

  isLoading = false;
  inkasantiList = [];
  novikorisnici = '';
  broj_naloga = '';
  broj_korisnika = '';
  inkasant = '';
  filter = '';

  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      yAxes: [{
        ticks: {
          fixedStepSize: 1
        }
      }],
    },
    legend: {
      display: true,
      onClick: function (e) {
        e.stopPropagation();
      }
    },
    animation: {
      duration: 0,
      onComplete: function () {
        const chartInstance = this.chart,
          ctx = chartInstance.ctx;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        this.data.datasets.forEach(function (dataset, i) {
          const meta = chartInstance.controller.getDatasetMeta(i);
          meta.data.forEach(function (bar, index) {
            const data = dataset.data[index];
            ctx.fillText(data, bar._model.x, bar._model.y - 5);
          });
        });
      }
    }
  };
  public barChartLabels: string[] = [];
  public barChartType = 'horizontalBar';
  public barChartLegend = true;

  public barChartData: any[] = [
    { data: [], label: 'Grafički prikaz učinka po nalozima' }
  ];

  constructor(private mysqlservice: MainService) { }

  ngOnInit() {
    this.barChartData[0]['data'] = [];
    this.barChartLabels = [];
    this.getInkasanti('');
    // this.getInkasantiReport(0);
  }


  getInkasantiReport(inkasant_id: number) {
    console.log(inkasant_id);
    this.isLoading = true;
    this.mysqlservice.getIncReport(this.filter, inkasant_id).subscribe((mydata: any) => {
      console.log(mydata);
      const origdata = mydata.data.data;
      const myarr = mydata.data.data.map(x => x.tipzaduzenja);
      this.novikorisnici = mydata.data.novi_korisnici[0].novi_korisnici;
      console.log(mydata.data.novi_korisnici[0].novi_korisnici);
      const counts = myarr.reduce((acc, cn) => {
        acc[cn] = acc[cn] ? acc[cn] + 1 : 1;
        return acc;
      }, Object.create({ data: '', values: 0 }));
      // console.log('Counts', counts);
      // console.log(Object.keys(counts)[0], Object.keys(counts)[1]);
      const vals = [];
      const labels = [];
      let i = 0;
      for (const key in counts) {
        if (counts.hasOwnProperty(key)) {
          labels.push(Object.keys(counts)[i]);
          vals.push(counts[key]);
          i++;
        }
      }

      const uniqNalozi = [...new Set(origdata.map(x => x.zaduzenje_id))];
      // console.log(uniqNalozi);
      this.broj_naloga = uniqNalozi.length.toString();
      this.broj_korisnika = origdata.length.toString();
      const ink = this.inkasantiList.filter(e => {
        return e.id === inkasant_id;
      });

      this.inkasant = ink[0]['firstname'] + ' ' + ink[0]['lastname'];
      this.barChartData[0]['data'] = vals;
      this.barChartLabels = labels;
      this.isLoading = false;
    });

    // datum: "2019-11-03T23:00:00.000Z"
    // datum_izvjestaja: "2019-11-03T23:00:00.000Z"
    // inkasant_id: 5
    // izvjestaj: "1. nalazi se na adresi"
    // kontrola_opis: "Kontrola po listingu"
    // tip_zaduzenja: "Kontrola"
    // zaduzenje_id: "NA-0005/19"

  }
  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  getInkasanti(fi: string) {
    this.isLoading = true;
    const ps = 500;
    const pi = 0;
    this.mysqlservice.getInkasanti(ps, pi, fi).subscribe((mydata: any) => {
      this.inkasantiList = mydata.data.filter(ink => {
        return ink.isInkasant === 1;
      });
      this.isLoading = false;
    });
  }

}
