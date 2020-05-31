import React, { Component, useContext } from "react";
import { render } from "react-dom";
import {firestore} from "./firebase"
import {
  Input,
  Stack,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,

} from "@chakra-ui/core";

import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/core";
import {navigate} from "@reach/router"

async function createNewDoc(projectId, uid, title = "") {
  const  docRef = await firestore.ref('doc/');
  const newRef = await docRef.push();
  const docId = newRef.key;


  await newRef.once('value').then(async (snapshot) => {
      // // console.log(snapshot.val());
      if(snapshot.val()) {
        return;
      }

        newRef.set({
          title: title,
          text: "",
          lastChanged: "",
          createdBy: uid,
        });

        const projectRef = await firestore.ref('project/' + projectId + '/doc' + docId).set({ docId });

        // firestore.ref('doc/' + projectId + '/collaborators/' + uid).set({
        //   creator: true,
        // })
        // firestore.ref('users/' + uid + '/myDocs/' + projectId).set({
        //   projectId
        // });
        // console.log("new doc created");


  });
  // // console.log(projectId);
  return projectId;
}

async function createNewProject(uid, title = "") {
  const  docRef = await firestore.ref('project/');
  const newRef = await docRef.push();
  const projectId = newRef.key;


  await newRef.once('value').then(function(snapshot) {
      // // console.log(snapshot.val());
      if(snapshot.val()) {
        return;
      }

        newRef.set({
          title: title,
          createdBy: uid,
        });

        // const projectRef = await firestore.ref('project/' + projectId + '/doc' + docId).set({ docId });

        firestore.ref('project/' + projectId + '/collaborators/' + uid).set({
          creator: true,
        })
        firestore.ref('users/' + uid + '/myProjects/' + projectId).set({
          projectId
        });
        // console.log("new doc created");


  });
  // // console.log(projectId);
  return projectId;
}

class NewEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount = async () => {
        // console.log("not going further");
        const projectId = await createNewProject(this.props.user, "");
        await navigate(`${projectId}`, { replace: true });

        return;

    }
    render() {
      return  (<Stack isInline spacing={4}>
      <Spinner size="xl" />
    </Stack>)
  }
  }

export default NewEditor;
