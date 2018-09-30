import {Component, OnInit} from '@angular/core';
import {AccueilService} from './accueil.service';
import {Semestre} from '../model/accueil/Semestre';
import {Lien} from '../model/accueil/Lien';
import {Groupe} from '../model/accueil/Groupe';
import {UE} from '../model/accueil/UE';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AccueilData} from '../model/accueil/AccueilData';
import {LZStringService} from 'ng-lz-string';
import {JsonPipe} from '@angular/common';
import {UEType} from '../model/accueil/interfaces';

@Component({
  selector: 'app-accueil-json',
  templateUrl: 'accueil-json.component.html',
})
export class AccueilJsonComponent implements OnInit {
  data: any;
  dataJson: any;
  accueilData: AccueilData;

  UEType = UEType;
  keys = Object.keys;

  constructor(private accueilService: AccueilService,
              private lz: LZStringService,
              private modalService: NgbModal) {}

  ngOnInit() {
    this.accueilService.getAccueilData('assets/data.json').subscribe(data => {
      this.accueilData = data;
    });
  }

  addLienPrimaire() {
    this.accueilData.liensPrimaires.push(new Lien());
  }

  addLienSecondaire() {
    this.accueilData.liensSecondaires.push(new Lien());
  }

  addGroupeSecondaire() {
    this.accueilData.groupesSecondaires.push(new Groupe());
  }

  addLienToGroupe(groupe: Groupe) {
    groupe.liens.push(new Lien());
  }

  addLienToSemestre(semestre: Semestre) {
    semestre.liens.push(new Lien());
  }

  addLienToUe(ue: UE) {
    ue.liens.push(new Lien());
  }

  addUeToSemestre(semestre: Semestre) {
    semestre.ue.push(new UE());
  }

  addSemestre() {
    this.accueilData.semestres.push(new Semestre());
  }

  deleteLienPrimaire(lien: Lien) {
    this.delete(this.accueilData.liensPrimaires, lien);
  }

  deleteLienSecondaire(lien: Lien) {
    this.delete(this.accueilData.liensSecondaires, lien);
  }

  deleteGroupeSecondaire(groupe: Groupe) {
    this.delete(this.accueilData.groupesSecondaires, groupe);
  }

  deleteLienFromGroupe(groupe: Groupe, lien: Lien) {
    this.delete(groupe.liens, lien);
  }

  deleteLienFromSemestre(semestre: Semestre, lien: Lien) {
    this.delete(semestre.liens, lien);
  }

  deleteLienFromUe(ue: UE, lien: Lien) {
    this.delete(ue.liens, lien);
  }

  deleteUeFromSemestre(semestre: Semestre, ue: UE) {
    this.delete(semestre.ue, ue);
  }

  deleteSemestre(semestre: Semestre) {
    this.delete(this.accueilData.semestres, semestre);
  }

  openModal(content): void {
    this.dataJson = new JsonPipe().transform(this.accueilService.formatData());
    this.data = this.lz.compress(this.dataJson);
    this.modalService.open(content, {size: 'lg'});
  }

  copyData(input) {
    input.select();
    document.execCommand('copy');
  }

  private delete<T>(collection: T[], obj: T) {
    collection.splice(collection.indexOf(obj), 1);
  }
}
