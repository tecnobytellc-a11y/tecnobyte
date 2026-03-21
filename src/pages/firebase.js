import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  TotpMultiFactorGenerator,
  TotpSecret
} from "firebase/auth";

// ==========================================
// 1. CONFIGURACIÓN DEL PROYECTO
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyBgqPltYbC8ZSzLszFA1y6FegfHJn91Ozg",
  authDomain: "tecnobyte-52ae0.firebaseapp.com",
  databaseURL: "https://tecnobyte-52ae0-default-rtdb.firebaseio.com",
  projectId: "tecnobyte-52ae0",
  storageBucket: "tecnobyte-52ae0.firebasestorage.app",
  messagingSenderId: "727089895868",
  appId: "1:727089895868:web:0412acf7c812a1f07b73b9",
  measurementId: "G-XC1PJ1PB6W"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ==========================================
// 2. AUTENTICACIÓN CON GOOGLE
// ==========================================
export const loginConGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error Google:", error.message);
    throw error;
  }
};

// ==========================================
// 3. CORREO Y CONTRASEÑA
// ==========================================
export const registrarConCorreo = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error Registro Correo:", error.message);
    throw error;
  }
};

export const loginConCorreo = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error Login Correo:", error.message);
    throw error;
  }
};

// ==========================================
// 4. RECUPERACIÓN DE CONTRASEÑA (EMAIL)
// ==========================================
export const recuperarContrasenaEmail = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true; // Correo enviado con éxito
  } catch (error) {
    console.error("Error Recuperación Email:", error.message);
    throw error;
  }
};

// ==========================================
// 5. TELÉFONO (REGISTRO, LOGIN Y RECUPERACIÓN)
// ==========================================
// Nota: Firebase usa el mismo método para registrar, loguear o validar un teléfono para recuperar cuenta.
export const prepararRecaptcha = (containerId) => {
  // Crea el captcha invisible necesario para evitar bots de SMS
  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible'
  });
};

export const enviarSMSVerificacion = async (phoneNumber) => {
  try {
    const appVerifier = window.recaptchaVerifier;
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = confirmationResult; // Se guarda para el siguiente paso
    return true;
  } catch (error) {
    console.error("Error enviando SMS:", error.message);
    throw error;
  }
};

export const confirmarCodigoSMS = async (codigo) => {
  try {
    const result = await window.confirmationResult.confirm(codigo);
    return result.user;
  } catch (error) {
    console.error("Código SMS incorrecto:", error.message);
    throw error;
  }
};

// ==========================================
// 6. VERIFICACIÓN EN 2 PASOS (2FA / MFA)
// ==========================================
// Activar 2FA por SMS
export const activar2FAPorSMS = async (phoneNumber) => {
  try {
    const user = auth.currentUser;
    const multiFactorSession = await multiFactor(user).getSession();
    const phoneInfoOptions = {
      phoneNumber: phoneNumber,
      session: multiFactorSession
    };
    const phoneAuthProvider = new PhoneAuthProvider(auth);
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, window.recaptchaVerifier);
    return verificationId; // Se necesita para confirmar el código después
  } catch (error) {
    console.error("Error iniciando 2FA SMS:", error.message);
    throw error;
  }
};

// Activar 2FA por App Autenticadora (Google Authenticator / Authy)
export const generarSecretoTOTP = async () => {
  try {
    const user = auth.currentUser;
    const multiFactorSession = await multiFactor(user).getSession();
    // Genera el secreto y el código QR (URI) para escanear
    const secret = await TotpMultiFactorGenerator.generateSecret(multiFactorSession);
    return secret; // Contiene secret.sharedSecretKey y secret.generateQrCodeUrl()
  } catch (error) {
    console.error("Error generando TOTP:", error.message);
    throw error;
  }
};

export const confirmar2FAAuthenticator = async (secret, codigoIngresado) => {
  try {
    const user = auth.currentUser;
    const multiFactorAssertion = TotpMultiFactorGenerator.assertionForEnrollment(secret, codigoIngresado);
    await multiFactor(user).enroll(multiFactorAssertion, "Autenticador de Google");
    return true; // 2FA activado con éxito
  } catch (error) {
    console.error("Error confirmando TOTP:", error.message);
    throw error;
  }
};

export default app;
