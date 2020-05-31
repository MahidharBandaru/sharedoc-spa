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
import Footer from "./Footer"
import Header from "./Header"
import NewProject from "./NewProject"
import NewDoc from "./NewDoc"

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
        <Header />
        <Router>
          <Dashboard path="/" />
          <NewProject path="editor/new" user={user.uid}/>
          <Editor path="editor/:projectId" user={user.uid}/>
          <NewDoc path="editor/:projectId/new" user={user.uid}/>
          <Editor path="editor/:projectId/:docId" user={user.uid}/>
        </Router>
        <Footer />
        </ThemeApp>
      :
      <ThemeApp>

        <Router>
          <SignIn path="/" />

        </Router>
        <Footer />

        </ThemeApp>

  );
}
export default Application;
