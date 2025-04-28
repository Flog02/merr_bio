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
      'CUSTOMER_REQUESTS':'Customer Requests',
      'SUPPORT':'Ndihme',
      'PRODUCT_IMAGES':'Product Images',
      'PROFILE_IMAGE_HINT':'Profile Image',
      'IMAGE_GUIDANCE':'Image Guidance',
      'ADD_IMAGE':'Add Image',
      'REMOVE_PHOTO':'Remove Photo',
      'MESSAGE_CLIENT':'Message Client',
      'VIEW':'VIEW',
      'PASSWORD_MIN_LENGTH':'Password too short',
      'EMAIL_INVALID':'Email Invalid',
      "Don't have an account?":"Don't have an account?",
      'Password is required':'Password is required',
      'ADD_TO_CART':'Add to cart',
      "SELECT": "Select",
      'Please_enter_a_valid_email_address':'Please enter a valid email address',
      'MESSAGE_FARMER':'Message Farmer',
      'ALREADY_HAVE_ACCOUNT':'Already have Account',
      'PURCHASE_REQUESTS':'Purchase Request',
      'DESCRIPTION_REQUIRED':'Description is Required',
      "PRICE_ALL": "Price (ALL)",
      "PRICE_REQUIRED": "Price is required",
      "PRICE_MIN": "Price must be greater than 0",
    
      "QUANTITY_REQUIRED": "Quantity is required",
      "QUANTITY_MIN": "Quantity must be greater than 0",
    
      "UNIT_REQUIRED": "Unit is required",
      "KG": "Kg",
      "LITER": "Liter",
      "PIECE": "Piece",
      "BUNCH": "Bunch",
    
      "UPDATE_PRODUCT": "Update Product",
      'FARMER_PRODUCTS':'Farmer Products',
      'VERIFIED_FARMER':'Verified Farmer',
      'CREATED_AT':'Created A',
      'FARMER_INFORMATION':'Farmer Information',
      'CHECK_PROFILE':'Check Profile',
      'DELETE_PRODUCT':'Delete Product',
      'APPROVE_PRODUCT':'Approve Product',
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
      'SEARCH_USERS': 'Search users...',
      'purchase_request':'Purchase Request',
      'purchase_request_message':'Purchase request message',
          "EMAIL_VERIFICATION": "Email Verification",
          "VERIFYING_EMAIL": "Verifying Email",
          "VERIFICATION_SUCCESS": "Verification Successful",
          "VERIFICATION_FAILED": "Verification Failed",
          "CHECKING_VERIFICATION_STATUS": "Checking verification status...",
          "VERIFY_YOUR_EMAIL": "Verify Your Email",
          "VERIFICATION_EMAIL_SENT": "A verification email has been sent to",
          "PLEASE_CHECK_INBOX": "Please check your inbox and click the verification link.",
          "ACCOUNT_DELETION_WARNING": "Your account will be deleted if not verified within:",
          "OPEN_EMAIL_APP": "Open Email App",
          "RESEND_EMAIL": "Resend Email",
          "CHECK_STATUS": "Check Status",
          "WARNING": "Warning",
          "EXIT_VERIFICATION_WARNING": "If you exit without verifying your email, your registration will be canceled.",
          "CONFIRM_EXIT": "Confirm Exit",
          "PROCESSING_VERIFICATION": "Processing your verification...",
          "VERIFICATION_SUCCESS_MESSAGE": "Your email has been successfully verified!",
          "GO_TO_DASHBOARD_NOW": "Go to Dashboard Now",
          "VERIFICATION_ERROR_MESSAGE": "We couldn't verify your email address. The link may have expired.",
          "GO_TO_LOGIN": "Go to Login",
          "FORGOT_PASSWORD": "Forgot Password",
          "RESET_YOUR_PASSWORD": "Reset Your Password",
          "PASSWORD_RESET_INSTRUCTIONS": "Enter your email address and we'll send you a link to reset your password.",
          "SEND_RESET_LINK": "Send Reset Link",
          "RESET_EMAIL_SENT": "Password reset email sent",
          "CHECK_INBOX_INSTRUCTIONS": "Please check your inbox and follow the instructions to reset your password.",
          "BACK_TO_LOGIN": "Back to Login",
          "USER_NOT_FOUND_TITLE": "Email Not Found",
          "USER_NOT_FOUND_MESSAGE": "We couldn't find an account with that email address. Please check and try again.",
          "ERROR_SENDING_RESET_EMAIL": "Error sending reset email. Please try again later.",
          
          "RESET_PASSWORD": "Reset Password",
          "CREATE_NEW_PASSWORD": "Create New Password",
          "VERIFYING_RESET_LINK": "Verifying reset link...",
          "INVALID_RESET_LINK": "Invalid Reset Link",
          "RESET_LINK_EXPIRED": "This password reset link has expired or has already been used. Please request a new one.",
          "REQUEST_NEW_LINK": "Request New Link",
          "RESET_PASSWORD_FOR": "Reset password for",
          "NEW_PASSWORD": "New Password",
          "CONFIRM_PASSWORD": "Confirm Password",
          "PASSWORDS_DONT_MATCH": "Passwords don't match",
          "PASSWORD_REQUIREMENTS": "Password requirements",
          "PASSWORD_CAPITAL_FIRST": "Must start with a capital letter",
          "PASSWORD_NUMBER_REQUIRED": "Must contain at least one number",
          "PASSWORD_RESET_SUCCESS": "Password Reset Successful",
          "PASSWORD_RESET_SUCCESS_MESSAGE": "Your password has been successfully reset. You can now log in with your new password.",
          "WEAK_PASSWORD": "Weak Password",
          "PASSWORD_TOO_WEAK": "The password you chose is too weak. Please choose a stronger password."
       
        
    },
    sq: {
      // Common
      'Password must start with a capital letter, contain at least one number, and be at least 8 characters long':'Passwordi duhet te nisi me shkronje kapitale , te permbaje te pakten nje numer dhe te pakten 8 karaktere',
      'CUSTOMER_REQUESTS':'Kerkesat e Klientit',
      'PRODUCT_IMAGES':'Imazhet e Produktit',
      'PROFILE_IMAGE_HINT':'Foto Profili',
      'IMAGE_GUIDANCE':'Guida e Fotove',
      'ADD_IMAGE':'Shto Foto',
      'REMOVE_PHOTO':'Fshi Foton',
      'MESSAGE_CLIENT':'Shkruaj Klientit',
      'purchase_request_message':'Mesazh per kërkese blerjeje',
      'purchase_request':'Kerko per te blere',
      'VIEW':'Shiko',
      'PASSWORD_MIN_LENGTH':'Password i shkurter',
      'EMAIL_INVALID':'Email i gabuar',
      "Don't have an account?":"Nuk keni account?",
      'Password is required':'Vendosni passwordin',
      'Please_enter_a_valid_email_address':'Ju lutem vendoseni emailin te sakte',
      "SELECT": "Zgjidh",
"NO_REQUESTS_YET": "Asnjë kërkesë ende",
  "NO_REQUESTS": "Asnjë kërkesë",
      'ADD_TO_CART':'Shto ne shporte',
      'MESSAGE_FARMER':'Shkruaj Fermerit',

      'ALREADY_HAVE_ACCOUNT':'Keni account',
      'PURCHASE_REQUESTS':'Kerkese Blerje',

      'SELECT_ALL': 'Select All',
      'SELECT_NONE': 'Select None',

      'DESCRIPTION_REQUIRED':'Vendos Pershkrimin',

      'DESCRIPTION':'Pershkrimi',
      "PRICE_ALL": "Cmimi (ALL)",
      "PRICE_REQUIRED": "Vendos Cmimin",
      "PRICE_MIN": "Cmimi duhet me i madhe se 0",
    
      "QUANTITY_REQUIRED": "Vendos Sasin",
      "QUANTITY_MIN": "Sasia duhet me i madhe se 0",
    
      "UNIT_REQUIRED": "Vendos Njesin",
      "KG": "Kg",
      "LITER": "Liter",
      "PIECE": "Cope",
      "BUNCH": "Tufe",
    
      "UPDATE_PRODUCT": "Ndrysho Produktin",
      "CATEGORY_REQUIRED": "Vendos Kategorin",
      'FARMER_PRODUCTS':'Produktet e Fermerit',
      'VERIFIED_FARMER':'Verifikuar',
      'CREATED_AT':'Data e Krijimit',
      'FARMER_INFORMATION':'Informacionet e Fermerit',
      'CHECK_PROFILE':'Shiko Profilin',
      'DELETE_PRODUCT':'Fshi Produktin',
      'APPROVE_PRODUCT':'Aprovo Produktin',
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
      'FRUITS': 'Fruta',
      'VEGETABLES': 'Perime',
      'DAIRY': 'Bulmet',
      'HONEY': 'Mjaltë',
      'WINE': 'Verë',
      'OIL': 'Vaj',
      'OTHER': 'Tjetër',
      'PRICE': 'Çmimi',
      'QUANTITY': 'Sasia',
      'UNIT': 'Njësia',
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
      'SEARCH_USERS': 'Kërko përdorues...',
      "EMAIL_VERIFICATION": "Verifikimi i Emailit",
    "VERIFYING_EMAIL": "Po Verifikohet Emaili",
    "VERIFICATION_SUCCESS": "Verifikimi i Suksesshëm",
    "VERIFICATION_FAILED": "Verifikimi Dështoi",
    "CHECKING_VERIFICATION_STATUS": "Duke kontrolluar statusin e verifikimit...",
    "VERIFY_YOUR_EMAIL": "Verifiko Emailin Tënd",
    "VERIFICATION_EMAIL_SENT": "Një email verifikimi është dërguar tek",
    "PLEASE_CHECK_INBOX": "Ju lutemi kontrolloni kutinë postare dhe klikoni lidhjen e verifikimit.",
    "ACCOUNT_DELETION_WARNING": "Llogaria juaj do të fshihet nëse nuk verifikohet brenda:",
    "OPEN_EMAIL_APP": "Hap Aplikacionin e Emailit",
    "RESEND_EMAIL": "Ridërgo Emailin",
    "CHECK_STATUS": "Kontrollo Statusin",
    "WARNING": "Paralajmërim",
    "EXIT_VERIFICATION_WARNING": "Nëse dilni pa verifikuar emailin tuaj, regjistrimi juaj do të anulohet.",
    "CONFIRM_EXIT": "Konfirmo Daljen",
    "PROCESSING_VERIFICATION": "Duke përpunuar verifikimin tuaj...",
    "VERIFICATION_SUCCESS_MESSAGE": "Emaili juaj është verifikuar me sukses!",
    "GO_TO_DASHBOARD_NOW": "Shko te Paneli Kryesor Tani",
    "VERIFICATION_ERROR_MESSAGE": "Nuk mund të verifikonim adresën tuaj të emailit. Lidhja mund të ketë skaduar.",
    "GO_TO_LOGIN": "Shko te Hyrja",
    "FORGOT_PASSWORD": "Keni Harruar Fjalëkalimin",
    "RESET_YOUR_PASSWORD": "Rivendosni Fjalëkalimin Tuaj",
    "PASSWORD_RESET_INSTRUCTIONS": "Vendosni adresën tuaj të emailit dhe ne do t'ju dërgojmë një lidhje për të rivendosur fjalëkalimin tuaj.",
    "SEND_RESET_LINK": "Dërgo Lidhjen e Rivendosjes",
    "RESET_EMAIL_SENT": "Email i rivendosjes së fjalëkalimit u dërgua",
    "CHECK_INBOX_INSTRUCTIONS": "Ju lutemi kontrolloni kutinë tuaj postare dhe ndiqni udhëzimet për të rivendosur fjalëkalimin tuaj.",
    "BACK_TO_LOGIN": "Kthehu te Hyrja",
    "USER_NOT_FOUND_TITLE": "Email nuk u gjet",
    "USER_NOT_FOUND_MESSAGE": "Nuk gjetëm një llogari me atë adresë emaili. Ju lutemi kontrolloni dhe provoni përsëri.",
    "ERROR_SENDING_RESET_EMAIL": "Gabim në dërgimin e emailit të rivendosjes. Ju lutemi provoni përsëri më vonë.",
    
    "RESET_PASSWORD": "Rivendos Fjalëkalimin",
    "CREATE_NEW_PASSWORD": "Krijo Fjalëkalim të Ri",
    "VERIFYING_RESET_LINK": "Duke verifikuar lidhjen e rivendosjes...",
    "INVALID_RESET_LINK": "Lidhje e Pavlefshme Rivendosjeje",
    "RESET_LINK_EXPIRED": "Kjo lidhje rivendosjeje e fjalëkalimit ka skaduar ose është përdorur tashmë. Ju lutemi kërkoni një të re.",
    "REQUEST_NEW_LINK": "Kërko Lidhje të Re",
    "RESET_PASSWORD_FOR": "Rivendos fjalëkalimin për",
    "NEW_PASSWORD": "Fjalëkalim i Ri",
    "CONFIRM_PASSWORD": "Konfirmo Fjalëkalimin",
    "PASSWORDS_DONT_MATCH": "Fjalëkalimet nuk përputhen",
    "PASSWORD_REQUIREMENTS": "Kërkesat e fjalëkalimit",
    "PASSWORD_CAPITAL_FIRST": "Duhet të fillojë me një shkronjë të madhe",
    "PASSWORD_NUMBER_REQUIRED": "Duhet të përmbajë të paktën një numër",
    "PASSWORD_RESET_SUCCESS": "Rivendosja e Fjalëkalimit me Sukses",
    "PASSWORD_RESET_SUCCESS_MESSAGE": "Fjalëkalimi juaj është rivendosur me sukses. Tani mund të hyni me fjalëkalimin tuaj të ri.",
    "WEAK_PASSWORD": "Fjalëkalim i Dobët",
    "PASSWORD_TOO_WEAK": "Fjalëkalimi që zgjodhët është shumë i dobët. Ju lutemi zgjidhni një fjalëkalim më të fortë."
 

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