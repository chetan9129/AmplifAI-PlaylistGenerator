// Import the functions you need from the SDKs you need
import { getAuth, GoogleAuthProvider } from "firebase/auth";

//
// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyDVYO2sNKRAvFoxHbNS6-_-c-iEkO0M7lw",

  authDomain: "amplifai-52311.firebaseapp.com",

  projectId: "amplifai-52311",

  storageBucket: "amplifai-52311.appspot.com",

  messagingSenderId: "965178414121",

  appId: "1:965178414121:web:41bf636975b65801eb7838",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
