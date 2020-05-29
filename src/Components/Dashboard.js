import React, { useContext, Component } from "react";
import { UserContext } from "../Providers/UserProvider";
import {auth, firestore} from "./firebase";

import { Link, ListItem, List } from "@chakra-ui/core";
import {navigate} from "@reach/router"

import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  AccordionIcon,
  Stack,
  Heading,
  Box,
  Text,
  Button,
} from "@chakra-ui/core";

function Feature({ title, desc, ...rest }) {
  return (
    <Box p={5} shadow="md" borderWidth="1px" {...rest}>
      <Heading fontSize="xl">{title}</Heading>
      <Text mt={4}>{desc}</Text>
    </Box>
  );
}

function StackEx() {
  return (
    <Stack spacing={8}>
      <Feature
        title="Plan Money"
        desc="The future can be even brighter but a goal without a plan is just a wish"
      />
      <Feature
        title="Save Money"
        desc="You deserve good things. With a whooping 10-15% interest rate per annum, grow your savings on your own terms with our completely automated process"
      />
    </Stack>
  );
}

async function getDocs (uid) {

  let ref = await firestore.ref(`users/${uid}/myDocs`).once ('value');
  let obj = ref.val (), docs = [];
  for (let x in obj) {
    docs.push (x);
  }
  return docs;
}

async function getDocNames (uid, docs) {
  let docNames = [];
  for (let dID of docs) {
    let ref = await firestore.ref (`doc/${dID}/title`).once ('value');
    let name = ref.val ();
    if (name.length == 0) name = "<No Title>"
    docNames.push ([name, dID]);
  }
  return docNames;
}
class Dashboard extends Component {
    static contextType = UserContext;

    handleNewFileCreation () {
      navigate(`/editor/new`);
    };

    constructor(props) {
        super(props);
        this.state = {
            // doc:
            docNames: []

        };
        this.handleNewFileCreation = this.handleNewFileCreation.bind(this);
    }

    componentDidMount = async () => {
      let uid = auth.W;
      let docs = await getDocs (uid);
      let docNames = await getDocNames (uid, docs);
      this.setState ({'docNames' : docNames});
    }

    render() {
      let arr = [];
      for (let l of this.state.docNames) {
        let title = l[0], id = l[1];
        let url = `/editor/${id}`
        arr.push (
          <ListItem><a href={url}>{title}</a></ListItem>
        );
      }
      return (
        <div>
          <Link onClick={this.handleNewFileCreation}>New File</Link>
          <br/>
          List of my docs:
          <List styleType="disc">
          {arr}
          </List>
        </div>
      );
        return (
          <div>

          <Accordion>
<AccordionItem>
  <AccordionHeader>
    <Box flex="1" textAlign="left">
      Section 1 title
    </Box>
    <AccordionIcon />
  </AccordionHeader>
  {/* <AccordionPanel pb={4}>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
    commodo consequat.
  </AccordionPanel> */}
</AccordionItem>

<AccordionItem>
  <AccordionHeader>
    <Box flex="1" textAlign="left" onChange={getDocs}>
      Section 2 title
    </Box>
    <AccordionIcon />
  </AccordionHeader>
  {/* <AccordionPanel pb={4}>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
    commodo consequat.
  </AccordionPanel> */}
</AccordionItem>
</Accordion>
<Button onClick = {() => {auth.signOut()}}>Sign out</Button>
</div>
        );

    }
  }
export default Dashboard;
