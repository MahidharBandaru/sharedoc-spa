import React, { useContext, Component } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Button, Input,
  Box, Heading, Text,
  Avatar,
  Stack,
} from "@chakra-ui/core";
import {firestore} from "./firebase"

async function removeCollaborator(projectId, uid) {
  console.log("inside here", projectId, uid);
  const docref = await firestore.ref('project/' + projectId + '/collaborators/' + uid);
  let snapshot = await docref.once('value');
  let ans;
  const val = snapshot.val();
  console.log(val);
  ans = true;
  if(!val) ans = false;
  if(ans === false) return "Collaborator not present";
  await firestore.ref('project/' + projectId + '/collaborators/' + uid).remove();
  await firestore.ref('users/' + uid + '/otherProjects/' + projectId).remove();


}

export class Feature extends Component {
  onRemove = async () => {
    // console.log(this.props.docId, this.props.uid);
    removeCollaborator(this.props.projectId, this.props.uid);
  }
  constructor(props) {
      super(props);
      this.onRemove = this.onRemove.bind(this);
  }
  render() {
  return (
    <Box p={2} shadow="md" borderWidth="1px">
    <Stack isInline>
    <Avatar name={this.props.displayName} src={this.props.profilePic} />
<Stack>
      <Heading fontSize="s">{this.props.displayName}</Heading>
      </Stack>
      <Button isDisabled={!this.props.showRemove} onClick={this.onRemove} variantColor="red" variant="solid">
    Remove
  </Button>
      </Stack>

    </Box>
  );
  }
}


async function addCollaborator(projectId, uid) {
  console.log("inside here", projectId, uid);
  const docref = await firestore.ref('project/' + projectId + '/collaborators/' + uid);
  let snapshot = await docref.once('value');
  let ans;
  const val = snapshot.val();
  console.log(val);
  ans = true;
  if(!val) ans = false;
  if(ans === true) return "Collaborator already exists";
  await firestore.ref('project/' + projectId + '/collaborators/' + uid).set({
    creator: false,
  });
  await firestore.ref('users/' + uid + '/otherProjects/' + projectId).set({
    projectId
  });


}



class  Collaborators extends Component {
  onOpen = (event) => {
      this.setState({ isOpen: true});
  };
  onClose = (event) => {
      this.setState({ isOpen: false});
  };
  handleChange = (event) => {
    // this.
    this.setState({isInvalid: false});

    this.setState({value: event.target.value});
    // // console.log(event.target.value);
  }
  checkIfCollabPossible = (email) => {
    // console.log(this.props.users);
    if(!this.props.users) return false;
    for(var uid in this.props.users) {
      let user = this.props.users[uid];
      // console.log(user.email, email);
      if(user.email === email) return user.uid;
    }
    this.setState({isInvalid: true});
    return false;
  }
  onAdd = async () => {
    let email = this.state.value;
    // console.log(email);
    let add = this.checkIfCollabPossible(email);
    if(add) {
      // console.log(add);

      await addCollaborator(this.props.projectId,add);
    }
    // console.log(this.props.users);
  }
  constructor(props) {
      super(props);
      console.log(props);
      this.state = {
        isOpen: false,
        value: "",
        isInvalid: false,
      };
      this.onOpen = this.onOpen.bind(this);
      this.onClose = this.onClose.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.checkIfCollabPossible = this.checkIfCollabPossible.bind(this);
      this.onAdd = this.onAdd.bind(this);

  }

render () {
  console.log(this.props, this.props.showRemove);
  return (
    <>
      <Button variantColor="teal" onClick={this.onOpen}>
        Collaborators
      </Button>
      <Drawer
        isOpen={this.state.isOpen}
        placement="right"
        onClose={this.onClose}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Collaborators</DrawerHeader>

          <DrawerBody>
          <Stack inLine>
            <Input isInvalid={this.state.isInvalid} errorBorderColor="red.300"placeholder="Add New. Enter gmail id." onChange={this.handleChange} />

            <Button onClick={this.onAdd}>Add</Button>
            </Stack>

            {this.props.children}

          </DrawerBody>


          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={this.onClose}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

}

export default Collaborators;
