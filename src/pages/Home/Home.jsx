import React from 'react';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.homeTitle}>Welcome to Home Page</h1>
      <p className={styles.homeDescription}>
        This is the home page of your application. Enjoy exploring!
      </p>
    </div>
  );
};

export default Home;