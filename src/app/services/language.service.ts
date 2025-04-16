import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  // Define translations
  private translations = {
    en: {
      // Common
      
      'MY_PROFILE':'My Profile',
      'HOW_IT_WORKS':'HOW IT WORKS',
      'LOGOUT': 'Logout',
      'APP_TITLE': 'MerrBio',
      'LOGIN': 'Login',
      'REGISTER': 'Register',
      'EMAIL': 'Email',
      'PASSWORD': 'Password',
      'SUBMIT': 'Submit',
      'CANCEL': 'Cancel',
      'SAVE': 'Save',
      'DELETE': 'Delete',
      'EDIT': 'Edit',
      'BACK': 'Back',
      'SEARCH': 'Search',
  
      // Home page
      'HOME_TITLE': 'Fresh Local Products',
      'HOME_SUBTITLE': 'Connect with local farmers and buy fresh products',
      'BROWSE_PRODUCTS': 'Browse Products',
  
      // Auth
      'SIGN_UP': 'Sign Up',
      'ROLE': 'Role',
      'CUSTOMER': 'Customer',
      'FARMER': 'Farmer',
      'NAME': 'Name',
      'PHONE': 'Phone Number',
      'LOCATION': 'Location',
  
      // Products
      'PRODUCTS': 'Products',
      'ALL': 'All',
      'FRUITS': 'Fruits',
      'VEGETABLES': 'Vegetables',
      'DAIRY': 'Dairy',
      'HONEY': 'Honey',
      'WINE': 'Wine',
      'OIL': 'Oil',
      'OTHER': 'Other',
      'PRICE': 'Price',
      'QUANTITY': 'Quantity',
      'UNIT': 'Unit',
      'DESCRIPTION': 'Description',
      'AVAILABILITY': 'Available',
      'CATEGORY': 'Category',
  
      // Farmer
      'FARMER_DASHBOARD': 'Farmer Dashboard',
      'ADD_PRODUCT': 'Add Product',
      'EDIT_PRODUCT': 'Edit Product',
      'PRODUCT_NAME': 'Product Name',
      'APPROVED': 'Approved',
      'PENDING': 'Pending Approval',
  
      // Customer
      'CUSTOMER_DASHBOARD': 'Customer Dashboard',
      'REQUEST_TO_BUY': 'Request to Buy',
      'CONTACT_FARMER': 'Contact Farmer',
      'MY_REQUESTS': 'My Requests',
  
      // Admin
      'ADMIN_DASHBOARD': 'Admin Dashboard',
      'PENDING_APPROVAL': 'Pending Approval',
      'ALL_PRODUCTS': 'All Products',
      'APPROVE': 'Approve',
  
      // Messages
      'MESSAGES': 'Messages',
      'NEW_MESSAGE': 'New Message',
      'TYPE_MESSAGE': 'Type a message...',
      'SEND': 'Send',
  
      // Purchase Requests
      'PURCHASE_REQUEST': 'Purchase Request',
      'REQUEST_QUANTITY': 'Request Quantity',
      'MESSAGE_TO_FARMER': 'Message to Farmer (Optional)',
      'SEND_REQUEST': 'Send Request',
      'REQUEST_STATUS': 'Status',
      'ACCEPT': 'Accept',
      'REJECT': 'Reject',
      'ACCEPTED': 'Accepted',
      'REJECTED': 'Rejected',
  
      // Extra
      'WELCOME_FARMER': 'Welcome, Farmer',
      'MANAGE_YOUR_PRODUCTS': 'Manage your products and view purchase requests',
      'TOTAL_PRODUCTS': 'Total Products',
      'MY_PRODUCTS': 'My Products',
      'NO_PRODUCTS_YET': 'You haven\'t added any products yet',
      'WELCOME_CUSTOMER': 'Welcome to Your Dashboard',
      'CUSTOMER_DASHBOARD_DESCRIPTION': 'Find fresh products and manage your requests',
      'BROWSE_PRODUCTS_DESCRIPTION': 'Find fresh local products from farmers near you',
      'VIEW_REQUESTS_DESCRIPTION': 'View the status of your purchase requests',
      'MESSAGES_DESCRIPTION': 'Chat with farmers about their products',
      'PROFILE_DESCRIPTION': 'Update your personal information',
      'PRODUCT_DETAILS': 'Product Details',
      'DETAILS': 'Details',
      'CONTACT': 'Contact',
      'SELECT_QUANTITY': 'Select Quantity',
      'CONFIRM_REQUEST': 'Are you sure you want to send a purchase request for this product?',
      'CONFIRM': 'Confirm',
      'REQUEST_SENT_SUCCESSFULLY': 'Your request has been sent successfully!',
      'BROWSE': 'Browse',
      'REQUEST': 'Request',
      'CONNECT': 'Connect',
      'BROWSE_DESCRIPTION': 'Browse through available fresh products from local farmers',
      'REQUEST_DESCRIPTION': 'Request to purchase products directly from the farmers',
      'CONNECT_DESCRIPTION': 'Connect and chat with farmers about their products',
      'FEATURED_PRODUCTS': 'Featured Products',
      'CATEGORIES': 'Categories',
      'VIEW_ALL': 'View All',
      'AVAILABLE': 'Available',
      'CUSTOMER_AREA': 'Customer Area',
      'FARMER_AREA': 'Farmer Area',
      'ADMIN_AREA': 'Admin Area',
      'ACCOUNT': 'Account',
      'SETTINGS': 'Settings',
      'PROFILE': 'Profile',
      'CONNECT_WITH_FARMERS': 'Connect with local farmers',
      'MANAGE_USERS': 'Manage Users',
      'NO_PRODUCTS_FOUND': 'No products found',
      'TRY_DIFFERENT_FILTER': 'Try a different filter or search term',
      'SEARCH_PRODUCTS': 'Search products...',
      'SEARCH_USERS': 'Search users...'
    },
    sq: {
      // Common
      'LANGUAGE':'Gjuha',
      'MY_PROFILE':'Profili Im',
            'HOW_IT_WORKS':'Si Perdoret',
      'LOGOUT': 'Dil',
      'APP_TITLE': 'MerrBio',
      'LOGIN': 'Hyr',
      'REGISTER': 'Regjistrohu',
      'EMAIL': 'Email',
      'PASSWORD': 'Fjalëkalimi',
      'SUBMIT': 'Dërgo',
      'CANCEL': 'Anulo',
      'SAVE': 'Ruaj',
      'DELETE': 'Fshi',
      'EDIT': 'Ndrysho',
      'BACK': 'Kthehu',
      'SEARCH': 'Kërko',
  
      // Home page
      'HOME_TITLE': 'Produkte të Freskëta Lokale',
      'HOME_SUBTITLE': 'Lidhu me fermerët vendas dhe bli produkte të freskëta',
      'BROWSE_PRODUCTS': 'Shfleto Produktet',
  
      // Auth
      'SIGN_UP': 'Regjistrohu',
      'ROLE': 'Roli',
      'CUSTOMER': 'Klient',
      'FARMER': 'Fermer',
      'NAME': 'Emri',
      'PHONE': 'Numri i telefonit',
      'LOCATION': 'Vendndodhja',
  
      // Products
      'PRODUCTS': 'Produktet',
      'ALL': 'Të gjitha',
      'FRUITS': 'Frutat',
      'VEGETABLES': 'Perimet',
      'DAIRY': 'Bulmet',
      'HONEY': 'Mjaltë',
      'WINE': 'Verë',
      'OIL': 'Vaj',
      'OTHER': 'Tjetër',
      'PRICE': 'Çmimi',
      'QUANTITY': 'Sasia',
      'UNIT': 'Njësia',
      'DESCRIPTION': 'Përshkrimi',
      'AVAILABILITY': 'Disponueshmëria',
      'CATEGORY': 'Kategoria',
  
      // Farmer
      'FARMER_DASHBOARD': 'Paneli i Fermerit',
      'ADD_PRODUCT': 'Shto Produkt',
      'EDIT_PRODUCT': 'Ndrysho Produkt',
      'PRODUCT_NAME': 'Emri i Produktit',
      'APPROVED': 'Aprovuar',
      'PENDING': 'Në pritje të aprovimit',
  
      // Customer
      'CUSTOMER_DASHBOARD': 'Paneli i Klientit',
      'REQUEST_TO_BUY': 'Kërko për të Blerë',
      'CONTACT_FARMER': 'Kontakto Fermerin',
      'MY_REQUESTS': 'Kërkesat e Mia',
  
      // Admin
      'ADMIN_DASHBOARD': 'Paneli i Administratorit',
      'PENDING_APPROVAL': 'Në Pritje të Aprovimit',
      'ALL_PRODUCTS': 'Të Gjitha Produktet',
      'APPROVE': 'Aprovo',
  
      // Messages
      'MESSAGES': 'Mesazhet',
      'NEW_MESSAGE': 'Mesazh i Ri',
      'TYPE_MESSAGE': 'Shkruaj një mesazh...',
      'SEND': 'Dërgo',
  
      // Purchase Requests
      'PURCHASE_REQUEST': 'Kërkesë Blerjeje',
      'REQUEST_QUANTITY': 'Sasia e Kërkuar',
      'MESSAGE_TO_FARMER': 'Mesazh për Fermerin (Opsionale)',
      'SEND_REQUEST': 'Dërgo Kërkesën',
      'REQUEST_STATUS': 'Statusi',
      'ACCEPT': 'Prano',
      'REJECT': 'Refuzo',
      'ACCEPTED': 'Pranuar',
      'REJECTED': 'Refuzuar',
  
      // Extra
      'WELCOME_FARMER': 'Mirësevjen, Fermer',
      'MANAGE_YOUR_PRODUCTS': 'Menaxho produktet e tua dhe shiko kërkesat për blerje',
      'TOTAL_PRODUCTS': 'Gjithsej Produkte',
      'MY_PRODUCTS': 'Produktet e Mia',
      'NO_PRODUCTS_YET': 'Ende nuk ke shtuar asnjë produkt',
      'WELCOME_CUSTOMER': 'Mirësevjen në Panelin tënd',
      'CUSTOMER_DASHBOARD_DESCRIPTION': 'Gjej produkte të freskëta dhe menaxho kërkesat e tua',
      'BROWSE_PRODUCTS_DESCRIPTION': 'Gjej produkte të freskëta nga fermerët afër teje',
      'VIEW_REQUESTS_DESCRIPTION': 'Shiko statusin e kërkesave për blerje',
      'MESSAGES_DESCRIPTION': 'Bisedo me fermerët për produktet e tyre',
      'PROFILE_DESCRIPTION': 'Përditëso informacionin personal',
      'PRODUCT_DETAILS': 'Detajet e Produktit',
      'DETAILS': 'Detajet',
      'CONTACT': 'Kontakt',
      'SELECT_QUANTITY': 'Zgjidh Sasinë',
      'CONFIRM_REQUEST': 'Je i sigurt që dëshiron të dërgosh një kërkesë për këtë produkt?',
      'CONFIRM': 'Konfirmo',
      'REQUEST_SENT_SUCCESSFULLY': 'Kërkesa u dërgua me sukses!',
      'BROWSE': 'Shfleto',
      'REQUEST': 'Kërkesë',
      'CONNECT': 'Lidhu',
      'BROWSE_DESCRIPTION': 'Shfleto produkte të freskëta nga fermerë lokalë',
      'REQUEST_DESCRIPTION': 'Kërko të blesh produkte direkt nga fermerët',
      'CONNECT_DESCRIPTION': 'Lidhu dhe bisedo me fermerët për produktet',
      'FEATURED_PRODUCTS': 'Produktet Kryesore',
      'CATEGORIES': 'Kategoritë',
      'VIEW_ALL': 'Shiko të Gjitha',
      'AVAILABLE': 'Disponueshëm',
      'CUSTOMER_AREA': 'Zona e Klientit',
      'FARMER_AREA': 'Zona e Fermerit',
      'ADMIN_AREA': 'Zona e Administratorit',
      'ACCOUNT': 'Llogaria',
      'SETTINGS': 'Cilësimet',
      'PROFILE': 'Profili',
      'CONNECT_WITH_FARMERS': 'Lidhu me fermerë lokalë',
      'MANAGE_USERS': 'Menaxho Përdoruesit',
      'NO_PRODUCTS_FOUND': 'Nuk u gjetën produkte',
      'TRY_DIFFERENT_FILTER': 'Provo një filtër ose fjalë tjetër',
      'SEARCH_PRODUCTS': 'Kërko produkte...',
      'SEARCH_USERS': 'Kërko përdorues...'
    }
  };

   private currentLang = new BehaviorSubject<string>('sq'); // Default to Albanian
  currentLang$ = this.currentLang.asObservable();

  constructor() {
    // Try to load saved language preference from localStorage
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && (savedLang === 'en' || savedLang === 'sq')) {
      this.currentLang.next(savedLang);
    }
  }

  setLanguage(lang: 'en' | 'sq') {
    this.currentLang.next(lang);
    localStorage.setItem('preferredLanguage', lang);
  }

  translate(key: string): string {
    const lang = this.currentLang.value;
    const translations = this.translations[lang as keyof typeof this.translations];
    
    if (translations && translations[key as keyof typeof translations]) {
      return translations[key as keyof typeof translations];
    }
    
    // Fallback to English if the key is not found in the current language
    if (lang !== 'en' && this.translations['en'][key as keyof typeof this.translations['en']]) {
      return this.translations['en'][key as keyof typeof this.translations['en']];
    }
    
    // Return the key itself if not found in any language
    return key;
  }
}