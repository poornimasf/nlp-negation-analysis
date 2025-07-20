import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import NegationAnalyzer from './components/NegationAnalyzer';
import awsconfig from './amplifyconfiguration.json';

Amplify.configure(awsconfig);

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="App">
          <div className="header">
            <h1>Expletive Negation Analysis</h1>
            <div className="user-info">
              <span>Welcome, {user.attributes.email}</span>
              <button onClick={signOut} className="sign-out-button">Sign out</button>
            </div>
          </div>
          <NegationAnalyzer />
        </div>
      )}
    </Authenticator>
  );
}

export default App;
