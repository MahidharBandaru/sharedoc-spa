import React, { useContext, Component } from "react";
import { UserContext } from "../Providers/UserProvider";
import {auth} from "./firebase";

import { Link } from "@chakra-ui/core";
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


class Dashboard extends Component {
    static contextType = UserContext;

    handleNewFileCreation () {
      navigate(`/editor/new`);
    };

    constructor(props) {
        super(props);
        this.state = {
            // doc:
        };
        this.handleNewFileCreation = this.handleNewFileCreation.bind(this);
    }

    render() {
        return (
          <div>

          <Accordion>
          <Link onClick={this.handleNewFileCreation}>New File</Link>
<AccordionItem>
  <AccordionHeader>
    <Box flex="1" textAlign="left">
      Section 1 title
    </Box>
    <AccordionIcon />
  </AccordionHeader>
  <AccordionPanel pb={4}>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
    commodo consequat.
  </AccordionPanel>
</AccordionItem>

<AccordionItem>
  <AccordionHeader>
    <Box flex="1" textAlign="left">
      Section 2 title
    </Box>
    <AccordionIcon />
  </AccordionHeader>
  <AccordionPanel pb={4}>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
    commodo consequat.
  </AccordionPanel>
</AccordionItem>
</Accordion>
<Button onClick = {() => {auth.signOut()}}>Sign out</Button>
</div>
        );

    }
  }
export default Dashboard;
