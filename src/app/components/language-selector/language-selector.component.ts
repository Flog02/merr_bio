import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from "../../pipes/translate.pipe";
@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslatePipe],
  template: `
    <ion-item lines="none">
      <ion-label>{{ 'LANGUAGE' | translate }}</ion-label>
      <ion-select [(ngModel)]="currentLang" (ionChange)="changeLanguage()" interface="popover">
        <ion-select-option value="sq">Shqip</ion-select-option>
        <ion-select-option value="en">English</ion-select-option>
      </ion-select>
    </ion-item>
  `
})
export class LanguageSelectorComponent implements OnInit {
  currentLang: string = 'sq'; // Default to Albanian

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  changeLanguage() {
    this.languageService.setLanguage(this.currentLang as 'en' | 'sq');
  }
}