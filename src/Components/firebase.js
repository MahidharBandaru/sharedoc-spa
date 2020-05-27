import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/database"

const firebaseConfig = {
    apiKey: "AIzaSyAk33_wBvoj0LjIZXILDExlObVgWOMPRG8",
    authDomain: "sharedoc-auth.firebaseapp.com",
    databaseURL: "https://sharedoc-auth.firebaseio.com",
    projectId: "sharedoc-auth",
    storageBucket: "sharedoc-auth.appspot.com",
    messagingSenderId: "170078588442",
    appId: "1:170078588442:web:59120168c4cea7d5b98ba3"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const firestore = firebase.database();


const provider = new firebase.auth.GoogleAuthProvider();
export const signInWithGoogle = () => {
  const ans = auth.signInWithPopup(provider);
};
