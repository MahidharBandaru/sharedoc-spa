import React, { useContext } from "react";
import { Router } from "@reach/router";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import ProfilePage from "./ProfilePage";
import PasswordReset from "./PasswordReset";
import Editor from "./Editor"
import Note from "./Note";
import {UserContext, UserProvider} from "../Providers/UserProvider";
import '../tailwind.generated.css';
function Application() {
  const user = useContext(UserContext);
  if(user) {
    // console.log(user);
  }
  return (
        (user && user.uid) ?
        <Router>
          <ProfilePage path="dashboard" />
          <Editor path="editor" user={user.uid}/>

        </Router>
      :
        <Router>
          <SignUp path="signUp" />
          <SignIn path="/" />
          <PasswordReset path = "passwordReset" />
          <Note path = "note" />
          <Editor path = "editor" />

        </Router>

  );
}
export default Application;