import React, { Component } from 'react';

import Header from './Header';
import SignupForm from './SignupForm';
import Recipes from './Recipes';
import Login from './Login';



class App extends Component {
  render() {

    return (
      <div className="App">
            <Header />
            <Recipes />
      </div>
    )
  }
}



export default App;