import React, { Component, createContext } from "react";
import { auth, firestore } from "../Components/firebase";

const UserContext = createContext({ user: null });
class UserProvider extends Component {
  state = {
    user: null
  };

  componentDidMount = () => {
    const  docRef = firestore.ref('users/');

    auth.onAuthStateChanged(userAuth => {
      this.setState({ user: userAuth });
      let flag = 0;
      if (userAuth) {
        const {uid, displayName, email, photoURL} = userAuth;
        const userRef = firestore.ref('users/' + uid);
        // const userRefByEmail = firestore.ref('users/' + email);

        userRef.once('value', function(snapshot) {
          const val = snapshot.val();
          if(!val) {
            // const newRef = docRef.push();
            userRef.set({
              uid, displayName, email, photoURL
            });
            // userRefByEmail.set({
            //    uid, displayName, email
            // });
            return;
          }
        });
      }
    });

  };
  render() {
    return (
      <UserContext.Provider value={this.state.user}>
        {this.props.children}
      </UserContext.Provider>
    );
  }
}
export { UserContext, UserProvider };
