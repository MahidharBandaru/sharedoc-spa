import React, { useContext, Component } from "react";
import { UserContext } from "../Providers/UserProvider";
import {auth, firestore} from "./firebase";

import { Chip } from "@material-ui/core"
import {navigate} from "@reach/router"

import { makeStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import SendIcon from '@material-ui/icons/Send';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

import {
  Stack,
  Heading,
  Box,
  Text,
} from "@chakra-ui/core";


const useStyles = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
}));


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

async function getOtherDocs (uid) {

  let ref = await firestore.ref(`users/${uid}/otherDocs`).once ('value');
  let obj = ref.val (), docs = [];
  for (let x in obj) {
    docs.push (x);
  }
  return docs;
}

async function getDocNames (uid, docs, otherDocs) {
  let docNames = [];
  for (let dID of docs) {
    let ref = await firestore.ref (`doc/${dID}/title`).once ('value');
    let name = ref.val ();
    if (name.length == 0) name = "<No Title>"
    docNames.push ([name, dID]);
  }
  for (let dID of otherDocs) {
    let ref = await firestore.ref (`doc/${dID}/title`).once ('value');
    let name = ref.val ();
    if (name.length == 0) name = "<No Title>"
    name += " [ Collab ]";
    docNames.push ([name, dID]);
  }
  console.log (docNames);
  return docNames;
}

function NestedList(arr) {
  // arr = Array.from(arr)
  console.log(arr.arr)
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <List
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          <font size="+2">My Projects</font>
        </ListSubheader>
      }
      className={classes.root}
    >
      <ListItem button onClick={handleClick}>
        <ListItemIcon>
          <SendIcon />
        </ListItemIcon>
        <ListItemText> Project 1 </ListItemText>
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {arr.arr.map(ele => <List component="div" disablePadding>
          <ListItem button className={classes.nested}>
            <ListItemIcon>
              <StarBorder />
            </ListItemIcon>
            <ListItemText> {ele} </ListItemText>
          </ListItem>
        </List>)}
      </Collapse>
    </List>
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
            docNames: []

        };
        this.handleNewFileCreation = this.handleNewFileCreation.bind(this);
    }

    

    componentDidMount = async () => {
      let uid = auth.W;
      let docs = await getDocs (uid);
      let otherDocs = await getOtherDocs (uid);
      let docNames = await getDocNames (uid, docs, otherDocs);
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

    console.log(arr)
    return(
      <div>
        <Fab color="secondary" aria-label="add" onClick={this.handleNewFileCreation}>
          <AddIcon label="Create New File"/>
        </Fab>
      <Chip size='medium' label='Create New file'/>
      <NestedList arr={arr}/>
      </div>
    );
    }
  }
  
export default Dashboard;
