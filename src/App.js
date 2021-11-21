import React, { useCallback, useEffect, useState } from "react";
import { useRef } from "react/cjs/react.development";
import "./App.css";

/**
 * Summary: This Component will render a row in a list
 * @param {Object} props
 *
 * @returns A row
 */
const ListItem = (props) => {
  console.log(props.badge);
  return (
    <div id="list-item" className="list-item-container">
      <div className="image-container">
        <img className="image" src={props.image} alt={props.name} />
      </div>
    </div>
  );
};

/**
 * Summary: This Component will manage the entire list
 * @param {Object} props
 *
 * @returns A list
 */
const ListView = (props) => {
  const listItems = props.listData.map(
    ({ mission_name, launch_year, links, launch_success }) => (
      <ListItem
        key={Math.random(19)}
        name={mission_name}
        year={launch_year}
        image={links.mission_patch_small}
        lauch={launch_success ? "Yes" : "No"}
      />
    )
  );

  return <div className="list-container">{listItems}</div>;
};

/**
 * Summary: Main component
 *
 */
const App = () => {
  // Create a state to store list of all launches by spacex
  // An offset variable is needed fetch next list of entries
  const [listData, updateList] = useState([]);
  const [showLoader, updateLoaderStatus] = useState(false);
  const offset = useRef(10);

  // Create an observer object
  // The observer will check if the div in the end of the page is visible in the viewport
  // The callback will do the following
  //    - check if the div is visibile, this is done using isIntersecting variable
  //    - if intersecting then call fetchData function
  const observer = useRef(null);
  observer.current = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry.isIntersecting) {
        return;
      }

      fetchData();
    },
    {
      root: document.querySelector("#App"),
      rootMargin: "0px",
      threshold: 0.3,
    }
  );

  /**
   * Summary: This function will handle api call
   * Description: API call is made and the list of data is decided by offset
   *              Once the data is received, filter is with what is needed
   *              update the state by appending with the new data
   *              Do not forget to increament the offset value
   *
   * Note: Added this function inside a callback to prevent re rendering
   */
  const fetchData = useCallback(() => {
    updateLoaderStatus(true);

    fetch(
      `https://api.spacexdata.com/v3/launches?limit=10&offset=${offset.current}`
    )
      .then((response) => response.json())
      .then((jsonData) => {
        const launchInfo = jsonData.map((data) => ({
          mission_name: data.mission_name,
          launch_year: data.launch_year,
          links: data.links,
          launch_success: data.launch_success,
        }));

        updateList((prevList) => [...prevList, ...launchInfo]);
        updateLoaderStatus(false);
        offset.current += 10;
      })
      .catch((error) => {
        console.log(error);
        updateLoaderStatus(false);
      });
  }, [updateList, updateLoaderStatus]);

  // ComponentDidMount, When the page renders, call the first set API to
  // fet first set of data.
  // Point the observer to the last div, so that when that div is visible
  // call the observer callback
  useEffect(() => {
    fetchData();

    observer.current.observe(document.querySelector("#last-row"));
  }, []);

  // The will display the List of badge for all launches along will
  // a dummy div which we use to detect end of the page
  return (
    <div className="App">
      <div className="container">
        <ListView listData={listData} />

        {/* show a loader indicating new data is being fetched */}
        {showLoader ? <div>Loading...</div> : null}

        {/* When this div is visible, fetch new data */}
        <div id="last-row"></div>
      </div>
    </div>
  );
};

export default App;
