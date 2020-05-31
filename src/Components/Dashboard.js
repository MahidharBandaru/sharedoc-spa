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

// import {navigate} from "@reach/router";

import {
  Stack,
  Heading,
  Box,
  Text,
  Button,
  Spinner,
} from "@chakra-ui/core";

class LinkComponent extends Component {
  onClick = async () => {
    await navigate(this.props.url);
  }
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }
  render () {
    return (
      <Button onClick={this.onClick}>{this.props.text}</Button>
      
    )
  }
}
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


async function getMyProjects(uid) {
  let ref = await firestore.ref(`users/${uid}/myProjects`).once ('value');
  let obj = ref.val (), projects = [];
  for (let x in obj) {
    projects.push (x);
  }
  return projects;
}
async function getOtherProjects(uid) {
  let ref = await firestore.ref(`users/${uid}/otherProjects`).once ('value');
  let obj = ref.val (), projects = [];
  for (let x in obj) {
    projects.push (x);
  }
  return projects;
}

async function getProjectNames (uid, myProjects, otherProjects) {
  let projectNames = [];
  for (let pID of myProjects) {
    let ref = await firestore.ref (`project/${pID}/title`).once ('value');
    let name = ref.val ();
    if (name.length === 0) name = "<Project>"
    projectNames.push ([name, pID]);
  }
  let otherProjectNames = [];
  for (let pID of otherProjects) {
    let ref = await firestore.ref (`project/${pID}/title`).once ('value');
    let name = ref.val ();
    console.log(name);
    if (name.length === 0) name = "<Project>"
    otherProjectNames.push ([name, pID]);
  }
  // console.log (docNames);
  return {projectNames, otherProjectNames};
}
//
// function NestedList(arr) {
//   // arr = Array.from(arr)
//   console.log(arr.arr)
//   const classes = useStyles();
//   const [open, setOpen] = React.useState(true);
//
//   const handleClick = () => {
//     setOpen(!open);
//   };
//
//   return (
//     <List
//       component="nav"
//       aria-labelledby="nested-list-subheader"
//       subheader={
//         <ListSubheader component="div" id="nested-list-subheader">
//           <font size="+2">My Projects</font>
//         </ListSubheader>
//       }
//       className={classes.root}
//     >
//       <ListItem button onClick={handleClick}>
//         <ListItemIcon>
//           <SendIcon />
//         </ListItemIcon>
//         <ListItemText> Project 1 </ListItemText>
//         {open ? <ExpandLess /> : <ExpandMore />}
//       </ListItem>
//       <Collapse in={open} timeout="auto" unmountOnExit>
//         {arr.arr.map(ele => <List component="div" disablePadding>
//           <ListItem button className={classes.nested}>
//             <ListItemIcon>
//               <StarBorder />
//             </ListItemIcon>
//             <ListItemText> {ele} </ListItemText>
//           </ListItem>
//         </List>)}
//       </Collapse>
//     </List>
//   );
// }

class Dashboard extends Component {
    static contextType = UserContext;

    handleNewFileCreation () {
      navigate(`/editor/new`);
    };

    constructor(props) {
        super(props);
        this.state = {
            // doc:
            projectNames: [],
            otherProjectNames: [],
            loading: true,


        };
        this.handleNewFileCreation = this.handleNewFileCreation.bind(this);
    }



    componentDidMount = async () => {
      let uid = auth.W;
      let projects = await getMyProjects(uid);
      let otherProjects = await getOtherProjects(uid);
      let projectNames = await getProjectNames (uid, projects, otherProjects);
      this.setState ({projectNames: projectNames.projectNames, otherProjectNames: projectNames.otherProjectNames});
      this.setState({loading: false});

    }

    render() {

  let arr = [], otherArr = [];
  for (let l of this.state.projectNames) {
    let title = l[0], id = l[1];
    let url = `/editor/${id}`
    arr.push (
      <LinkComponent url={url} text={title} />
    );
  }
  for (let l of this.state.otherProjectNames) {
    let title = l[0], id = l[1];
    let url = `/editor/${id}`
    otherArr.push (
      <LinkComponent url={url} text={title} />
    );
  }

    console.log(arr)
    return(
      (this.state.loading ? (<Stack isInline spacing={4}>
      <Spinner size="xl" />
    </Stack>) : (<div>
      <Fab color="secondary" aria-label="add" onClick={this.handleNewFileCreation}>
        <AddIcon label="Create New Project"/>
      </Fab>
    <Chip size='medium' label='Create New Project'/>
    <Stack>
    <Heading as="h3" size="lg">
  My Projects
</Heading >
    {arr}
    <Heading as="h3" size="lg">
  Other Projects
</Heading>
{otherArr}
    </Stack>
    </div>))

    );
    }
  }

export default Dashboard;
