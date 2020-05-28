import React, { useContext } from "react";
import { Router } from "@reach/router";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import ProfilePage from "./ProfilePage";
import PasswordReset from "./PasswordReset";
import Editor from "./Editor"
import Note from "./Note";
import {UserContext, UserProvider} from "../Providers/UserProvider";
import Dashboard from "./Dashboard"
import Nav from "./Nav"
import '../tailwind.generated.css';

import { ThemeProvider, CSSReset } from '@chakra-ui/core'
import customTheme from "./theme"

function ThemeApp({ children }) {
  return (
    <ThemeProvider theme={customTheme}>
      <CSSReset />
      {children}
    </ThemeProvider>
  );
}


function Application() {
  const user = useContext(UserContext);
  if(user) {
    // console.log(user);
  }
  return (
        (user && user.uid) ?
        <ThemeApp>
        <Nav />
        <Router>
          <Dashboard path="/" />
          <Editor path="editor/:docId" user={user.uid}/>

        </Router>
        </ThemeApp>
      :
      <ThemeApp>

        <Router>
          <SignIn path="/" />

        </Router>
        </ThemeApp>

  );
}
export default Application;
