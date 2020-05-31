import React, { useContext, Component } from "react";
import {navigate} from "@reach/router";
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


export class FileLink extends Component {
  onClick = async (event) => {
    navigate(this.props.link);
    // this.forceUpdate();
    // reload();
    window.location.reload(false);
  }
  constructor(props) {
      super(props);
  }
  render() {
  return (
    <Button variantColor="teal" variant="outline" width="100%" onClick={this.onClick}>
      {this.props.children}
    </Button>
  );
  }
}


class  Browser extends Component {
  onOpen = (event) => {
      this.setState({ isOpen: true});
  };
  onClose = (event) => {
      this.setState({ isOpen: false});
  };
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

  }

render () {
  console.log(this.props, this.props.showRemove);
  return (
    <>
      <Button variantColor="teal" onClick={this.onOpen}>
        Browser
      </Button>
      <Drawer
        isOpen={this.state.isOpen}
        placement="right"
        onClose={this.onClose}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Browser</DrawerHeader>

          <DrawerBody>
          <Stack>
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

export default Browser;
