import React, { useState } from "react";
import { Link } from "@reach/router";
import '../tailwind.generated.css';
import { signInWithGoogle } from "./firebase";
import { auth } from "./firebase";
const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const signInWithEmailAndPasswordHandler =
    (event, email, password) => {
      event.preventDefault();
    };

  const onChangeHandler = (event) => {
    const { name, value } = event.currentTarget;

    if (name === 'userEmail') {
      setEmail(value);
    }
    else if (name === 'userPassword') {
      setPassword(value);
    }
  };

  return (
    <div className="mt-8">
      <h1 className="text-3xl mb-2 text-center font-bold">Sign In</h1>
      <div className="border border-blue-400 mx-auto w-11/12 md:w-2/4 rounded py-8 px-4 md:px-8">
        {error !== null && <div className="py-4 bg-red-600 w-full text-white text-center mb-3">{error}</div>}

        <button
          className="bg-red-500 hover:bg-red-600 w-full py-2 text-white" onClick={() => {
            signInWithGoogle()
          }}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};
export default SignIn;
