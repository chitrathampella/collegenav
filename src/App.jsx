import React, { useState, useEffect, useRef, useMemo } from 'react';
import useGeolocation from './hooks/useGeolocation';
import { classrooms } from './data/rooms';
import { buildingGraphs } from './data/graph';
import { dijkstra } from './utils/pathfinding';
import { speakText, stopSpeech } from './utils/speech'; // Assuming speech.js is in ./utils/
import './App.css';
import roomNames from './data/roomNames';
import nodeCoordinates from './data/nodeCoordinates';

const blockImages = {
  O_BLOCK: ['/images/o block.jpg', '/images/o block 2.jpeg',],
  NA_BLOCK: ['/images/na block.jpg', '/images/na block (2).jpg', '/images/na block 3.jpg', '/images/nb block events.png', ],
  NB_BLOCK: ['/images/nb block.png', '/images/auditorium.jpg', '/images/computer labs.png', '/images/labs.png', '/images/library.jpg'],
  MAIN_BLOCK: ['/images/main block.jpg', '/images/classroom.png', '/images/main block 2.jpeg', '/images/main block 3.jpeg', '/images/main block 4.jpg', '/images/main block 5.jpg'],
  CANTEEN_MAIN: ['/images/canteen main.png'],
  NCC_AREA_PLAYGROUND: ['/images/ncc area.jpg', '/images/play area.jpg', '/images/events.png'],
  BUS_PARKING_AREA: ['/images/bus.jpg'],
  SOLAR_POWER_POINT: ['/images/solar point.png'],
  GATES: ['/images/entrance.png'],
  H_BLOCK: ['/images/h_block_placeholder.jpg'],
  GOVT_MED_COLLEGE: ['/images/med_college_placeholder.jpg'],
  FACULTY_PARKING: ['/images/faculty_parking_placeholder.jpg'],
  PHARMACY_BLOCK: ['/images/pharmacy_block_placeholder.jpg'],
  WATER_HARVESTING_POINT: ['/images/water_harvesting_placeholder.jpg'],
  BAHUBALI_BUILDING: ['/images/bahubali.jpg'],
  CANTEEN_NEW: ['/images/canteen_new_placeholder.jpg'],
  CANTEEN_NB: ['/images/canteen_nb_placeholder.jpg'],
  RECEPTION: ['/images/reception_placeholder.jpg'],
  WAITING_HALL: ['/images/waiting_hall_placeholder.jpg'],
  MINERAL_WATER: ['/images/mineral_water_placeholder.jpg'],
};

export const mapLatLonToSvg = (lat, lon) => {
  const topLeft = { lat: 17.207836, lon: 78.600237, x: 0, y: 0 };
  const bottomRight = { lat: 17.203220, lon: 78.602922, x: 210, y: 297 };
  if (lat < bottomRight.lat || lat > topLeft.lat || lon < topLeft.lon || lon > bottomRight.lon) return { x: -1, y: -1 };
  const xRatio = (lon - topLeft.lon) / (bottomRight.lon - topLeft.lon);
  const finalYRatio = (topLeft.lat - lat) / (topLeft.lat - bottomRight.lat);
  return { x: xRatio * (bottomRight.x - topLeft.x), y: finalYRatio * (bottomRight.y - topLeft.y) };
};

const connectYouToNearestNode = (originalGraph, userSvgPos) => {
  if (!originalGraph || typeof originalGraph !== 'object' || Object.keys(originalGraph).length === 0) {
    if (userSvgPos && typeof userSvgPos.x === 'number' && userSvgPos.x !== -1) return { 'YOU_ARE_HERE': {} };
    return {};
  }
  const cloneGraph = JSON.parse(JSON.stringify(originalGraph));
  let closestNode = null; let minDistance = Infinity;
  for (const nodeKey in originalGraph) {
    if (originalGraph.hasOwnProperty(nodeKey)) {
      const point = classrooms[nodeKey] || nodeCoordinates[nodeKey];
      if (point && typeof point.x === 'number' && typeof point.y === 'number' && userSvgPos && typeof userSvgPos.x === 'number' && typeof userSvgPos.y === 'number') {
        const dx = userSvgPos.x - point.x; const dy = userSvgPos.y - point.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) { minDistance = dist; closestNode = nodeKey; }
      }
    }
  }
  if (closestNode && userSvgPos && typeof userSvgPos.x === 'number' && userSvgPos.x !== -1) {
    if (!cloneGraph['YOU_ARE_HERE']) cloneGraph['YOU_ARE_HERE'] = {};
    cloneGraph['YOU_ARE_HERE'][closestNode] = minDistance;
    if (!cloneGraph[closestNode]) cloneGraph[closestNode] = {};
    cloneGraph[closestNode]['YOU_ARE_HERE'] = minDistance;
  } else if (userSvgPos && typeof userSvgPos.x === 'number' && userSvgPos.x !== -1 && !cloneGraph['YOU_ARE_HERE']) {
    cloneGraph['YOU_ARE_HERE'] = {};
  }
  return cloneGraph;
};

const getRoomContext = (roomName) => {
  if (!roomName) return 'LANDMARKS_HUB';
  if (nodeCoordinates[roomName] && !classrooms[roomName]) {
      if (roomName.startsWith('NB_ENT') || roomName.startsWith('NB_EXIT')) return 'NB';
      if (roomName.startsWith('NA_ENT') || roomName.startsWith('NA_EXIT')) return 'NA';
      if (roomName.startsWith('O_ENT')) return 'O';
      if (roomName.startsWith('MAIN_PATH_ENT')) return 'MAIN';
      if (roomName.startsWith('PHAR_ENT')) return 'PHARMACY';
      return 'LANDMARKS_HUB';
  }
  if (roomName.startsWith('A')) return 'NA';
  if (roomName.startsWith('B') || roomName === "CANTEEN_NB") return 'NB';
  if (roomName.startsWith('M') || ['RECEPTION', 'WAITING_HALL', 'MINERAL_WATER'].includes(roomName)) return 'MAIN';
  if (roomName.startsWith('O')) return 'O';
  const blockMap = { 'NA_BLOCK': 'NA', 'NB_BLOCK': 'NB', 'MAIN_BLOCK': 'MAIN', 'O_BLOCK': 'O', 'PHARMACY_BLOCK': 'PHARMACY' };
  if (blockMap[roomName]) return blockMap[roomName];
  return 'LANDMARKS_HUB';
};

const truncateText = (text, maxLength) => {
  if (!text) return ''; if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};

const getNodeDisplayName = (nodeKey, navMode, isSimulated, includeKey = true) => {
    if (!nodeKey) return "Unknown";
    if (nodeKey === 'YOU_ARE_HERE' && navMode === 'currentLocation') {
      return isSimulated ? "Your Simulated Location" : "Your Current Location";
    }
    const friendlyName = roomNames[nodeKey];
    const baseName = nodeKey.replace(/_/g, ' ');
    if (friendlyName && includeKey && friendlyName.toLowerCase() !== baseName.toLowerCase()) {
      return `${nodeKey} - ${friendlyName}`;
    } else if (friendlyName) {
      return friendlyName;
    } else {
      return baseName;
    }
  };

// Helper function to compare two path arrays (arrays of strings)
const pathsAreEqual = (pathA, pathB) => {
  if (!pathA && !pathB) return true; // Both null/undefined
  if (!pathA || !pathB) return false; // One is null/undefined
  if (pathA.length !== pathB.length) return false;
  for (let i = 0; i < pathA.length; i++) {
    if (pathA[i] !== pathB[i]) return false;
  }
  return true;
};

const App = () => {
  const { location, error: geolocationError } = useGeolocation();
  const [selectedRoom, setSelectedRoom] = useState('');
  const [geoError, setGeoError] = useState("");
  const [navigationMode, setNavigationMode] = useState('currentLocation');
  const [manualStartRoom, setManualStartRoom] = useState('');

  const [isRobotActive, setIsRobotActive] = useState(false);
  const [robotMessage, setRobotMessage] = useState("Click me for directions!");
  const [isUiSpeaking, setIsUiSpeaking] = useState(false);
  const speechStateRef = useRef({
    isSpeakingInternal: false, pathNodeIndex: -1,
    currentPathForSpeech: [], currentUtterance: null
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [pathError, setPathError] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
        () => setGeoError(""),
        () => setGeoError("Location access denied or unavailable. Consider selecting a start point manually.")
    );
    return () => {
      stopSpeech();
      if(speechStateRef.current.currentUtterance) {
        speechStateRef.current.currentUtterance.onend = null;
        speechStateRef.current.currentUtterance.onerror = null;
      }
    };
  }, []);

  useEffect(() => {
    const initVoices = async () => {
      speechSynthesis.getVoices();
      return new Promise(resolve => {
        if (speechSynthesis.getVoices().length > 0) {
          resolve();
        } else {
          speechSynthesis.onvoiceschanged = () => resolve();
        }
      });
    };

    const testAudio = async () => {
      await initVoices();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      oscillator.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
      setTimeout(() => {
        const testUtterance = new SpeechSynthesisUtterance('Navigation system ready');
        testUtterance.volume = 1.0;
        testUtterance.onend = () => console.log('Test speech completed');
        testUtterance.onerror = (e) => console.error('Test speech failed:', e);
        speechSynthesis.speak(testUtterance);
      }, 500);
    };
    testAudio().catch(console.error);
    return () => {
      stopSpeech();
      if (speechStateRef.current.currentUtterance) {
        speechStateRef.current.currentUtterance.onend = null;
        speechStateRef.current.currentUtterance.onerror = null;
      }
    };
  }, []);

  const [tooltipData, setTooltipData] = useState(null);
  const tooltipTimeoutRef = useRef(null);

  const falseLocation = { latitude: 17.20760, longitude: 78.60070 };
  const currentLocation = location ? location : falseLocation;
  const usingSimulatedLocation = !location;

  const userSvgPos = useMemo(() => {
    if (currentLocation && typeof currentLocation.latitude === 'number' && typeof currentLocation.longitude === 'number') {
        return mapLatLonToSvg(currentLocation.latitude, currentLocation.longitude);
    } return { x: -1, y: -1 };
  }, [currentLocation]);

  const isUserOutOfBounds = useMemo(() => userSvgPos && userSvgPos.x === -1 && userSvgPos.y === -1 && navigationMode === 'currentLocation', [userSvgPos, navigationMode]);

  const destination = useMemo(() => {
    if (!selectedRoom) return null; const coords = classrooms[selectedRoom] || nodeCoordinates[selectedRoom];
    return coords && typeof coords.x === 'number' ? coords : null;
  }, [selectedRoom]);

  const manualStartCoords = useMemo(() => {
    if (!manualStartRoom) return null; const coords = classrooms[manualStartRoom] || nodeCoordinates[manualStartRoom];
    return coords && typeof coords.x === 'number' ? coords : null;
  }, [manualStartRoom]);

  const [currentUserContext, setCurrentUserContext] = useState('LANDMARKS_HUB');
  const [graphForPathfinding, setGraphForPathfinding] = useState({});
  const [showLegend, setShowLegend] = useState(false);
  const [showPathDialog, setShowPathDialog] = useState(false);

  const togglePathDialog = () => {
    setShowPathDialog(!showPathDialog);
  };

  const handleLandmarkMouseEnter = (blockKey, event) => {
    clearTimeout(tooltipTimeoutRef.current); const landmarkCoords = classrooms[blockKey] || nodeCoordinates[blockKey];
    if (!landmarkCoords || typeof landmarkCoords.x !== 'number') return; const svgContainer = event.currentTarget.closest('.map-scroll-container');
    if (!svgContainer) return; const rect = svgContainer.getBoundingClientRect();
    const x = event.clientX - rect.left + svgContainer.scrollLeft; const y = event.clientY - rect.top + svgContainer.scrollTop;
    setTooltipData({ blockKey, images: blockImages[blockKey] || [], coords: { top: y, left: x } });
  };
  const handleLandmarkMouseLeave = () => { tooltipTimeoutRef.current = setTimeout(() => setTooltipData(null), 200);};
  const handleTooltipContentMouseEnter = () => { clearTimeout(tooltipTimeoutRef.current);};
  const handleTooltipContentMouseLeave = () => { handleLandmarkMouseLeave();};

  useEffect(() => {
    if (navigationMode === 'currentLocation' && userSvgPos && typeof userSvgPos.x === 'number' && userSvgPos.x !== -1 && typeof userSvgPos.y === 'number') {
        let closestBlockPortal = null; let minDistToPortal = Infinity;
        const blockPortals = ["NB_BLOCK", "NA_BLOCK", "MAIN_BLOCK", "O_BLOCK", "GATES", "PHARMACY_BLOCK"];
        let newDeterminedContext = 'LANDMARKS_HUB';
        blockPortals.forEach(portal => {
            const portalCoords = classrooms[portal] || nodeCoordinates[portal];
            if (portalCoords && typeof portalCoords.x === 'number' && typeof portalCoords.y === 'number') {
                const dx = userSvgPos.x - portalCoords.x; const dy = userSvgPos.y - portalCoords.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDistToPortal) { minDistToPortal = dist; closestBlockPortal = portal; }
            }
        });
        const insideBlockThreshold = 35;
        if (closestBlockPortal && minDistToPortal < insideBlockThreshold) newDeterminedContext = getRoomContext(closestBlockPortal);
        if (newDeterminedContext !== currentUserContext) setCurrentUserContext(newDeterminedContext);
    } else if (navigationMode === 'currentLocation' && 'LANDMARKS_HUB' !== currentUserContext) {
        setCurrentUserContext('LANDMARKS_HUB');
    }
  }, [userSvgPos, currentUserContext, navigationMode]);

  useEffect(() => {
    let finalGraph = {};
    if (buildingGraphs.LANDMARKS_HUB && typeof buildingGraphs.LANDMARKS_HUB === 'object') {
      for (const node in buildingGraphs.LANDMARKS_HUB) {
        if (buildingGraphs.LANDMARKS_HUB.hasOwnProperty(node)) {
          finalGraph[node] = { ...buildingGraphs.LANDMARKS_HUB[node] };
        }
      }
    }
    const mergeBlockContext = (contextKey) => {
      if (contextKey && contextKey !== 'LANDMARKS_HUB' && buildingGraphs[contextKey] && typeof buildingGraphs[contextKey] === 'object') {
        const blockData = buildingGraphs[contextKey];
        for (const node in blockData) {
          if (blockData.hasOwnProperty(node)) {
            finalGraph[node] = { ...(finalGraph[node] || {}), ...blockData[node] };
          }
        }
      }
    };
    const destinationCtx = selectedRoom ? getRoomContext(selectedRoom) : null;
    const startCtxForManual = manualStartRoom ? getRoomContext(manualStartRoom) : null;

    if (navigationMode === 'currentLocation') {
      mergeBlockContext(currentUserContext);
      if (destinationCtx && destinationCtx !== currentUserContext) mergeBlockContext(destinationCtx);
      if (userSvgPos && userSvgPos.x !== -1) setGraphForPathfinding(connectYouToNearestNode(finalGraph, userSvgPos));
      else setGraphForPathfinding(finalGraph);
    } else {
      mergeBlockContext(startCtxForManual);
      if (destinationCtx && destinationCtx !== startCtxForManual) mergeBlockContext(destinationCtx);
      setGraphForPathfinding(finalGraph);
    }
  }, [navigationMode, currentUserContext, userSvgPos, manualStartRoom, selectedRoom]);

  const startNodeForDijkstra = useMemo(() => {
    if (navigationMode === 'currentLocation') return (userSvgPos && userSvgPos.x !== -1) ? 'YOU_ARE_HERE' : null;
    return manualStartRoom || null;
  }, [navigationMode, userSvgPos, manualStartRoom]);

  const path = useMemo(() => {
    console.log(`[path useMemo] Re-calculating path. selectedRoom: "${selectedRoom}", startNodeForDijkstra: "${startNodeForDijkstra}"`);
    setPathError(''); // Clear previous errors

    if (!graphForPathfinding || Object.keys(graphForPathfinding).length === 0 || !startNodeForDijkstra || !selectedRoom) {
      return [];
    }

    const startNodeExists = graphForPathfinding.hasOwnProperty(startNodeForDijkstra);
    const endNodeExists = graphForPathfinding.hasOwnProperty(selectedRoom);

    if (!startNodeExists || !endNodeExists) {
      setPathError('Path not found: One or more locations are not accessible');
      console.error(`[path useMemo] Path calc error: Start (${startNodeForDijkstra}, exists: ${startNodeExists}) or End (${selectedRoom}, exists: ${endNodeExists}) not in graphForPathfinding.`);
      return [];
    }

    if (startNodeForDijkstra === selectedRoom) {
      return [startNodeForDijkstra];
    }

    try {
      const result = dijkstra(graphForPathfinding, startNodeForDijkstra, selectedRoom);
      if (!result || result.length === 0) {
        setPathError('No valid path found between these locations');
      }
      return result;
    } catch (e) {
      console.error("Dijkstra error:", e);
      setPathError('Error finding path: Please try different locations');
      return [];
    }
  }, [selectedRoom, destination, graphForPathfinding, startNodeForDijkstra, navigationMode, manualStartRoom]);

  const isPathRenderable = useMemo(() => {
    if (!path || !startNodeForDijkstra || !selectedRoom) { return false; }
    if (path.length === 1 && path[0] === startNodeForDijkstra && startNodeForDijkstra === selectedRoom) { return true; }
    if (path.length > 1 && path[0] === startNodeForDijkstra) { return true; }
    return false;
  }, [path, startNodeForDijkstra, selectedRoom]);

  const narratePathStep = () => {
    const { pathNodeIndex, currentPathForSpeech } = speechStateRef.current;
    
    if (!speechStateRef.current.isSpeakingInternal || !currentPathForSpeech || pathNodeIndex >= currentPathForSpeech.length) {
      let finalMessage = "Navigation complete.";
      if (pathNodeIndex >= currentPathForSpeech.length && currentPathForSpeech.length > 0) {
        finalMessage = "You have reached your destination.";
      }
      setRobotMessage(finalMessage);
      speechStateRef.current.currentUtterance = speakText(
        finalMessage,
        () => {
          speechStateRef.current.isSpeakingInternal = false;
          setIsUiSpeaking(false);
        },
        (error) => { // This is App.jsx:371 in the new full code if counting from top
          console.error('Final speech error:', error);
          speechStateRef.current.isSpeakingInternal = false;
          setIsUiSpeaking(false);
          setRobotMessage("Error in speech synthesis. Please try again.");
        }
      );
      return;
    }

    const currentNode = currentPathForSpeech[pathNodeIndex];
    let instruction = "";
    if (pathNodeIndex === 0) {
      instruction = `Starting from ${getNodeDisplayName(currentNode, navigationMode, usingSimulatedLocation, false)}. `;
    }
    if (pathNodeIndex < currentPathForSpeech.length - 1) {
      const nextNode = currentPathForSpeech[pathNodeIndex + 1];
      instruction += `Go to ${getNodeDisplayName(nextNode, navigationMode, usingSimulatedLocation, false)}.`;
    }
    setRobotMessage(instruction);

    try {
      speechStateRef.current.currentUtterance = speakText(
        instruction,
        () => {
          if (speechStateRef.current.isSpeakingInternal) {
            speechStateRef.current.pathNodeIndex += 1;
            setTimeout(() => narratePathStep(), 500);
          }
        },
        (error) => { // This is App.jsx:399 in the new full code
          console.error("Narration error:", error); // This matches the screenshot's App.jsx:393 (line numbers can shift)
          speechStateRef.current.isSpeakingInternal = false;
          setIsUiSpeaking(false);
          setRobotMessage("Navigation interrupted. Click robot to retry.");
        }
      );
    } catch (error) {
      console.error("Speech synthesis error:", error);
      speechStateRef.current.isSpeakingInternal = false;
      setIsUiSpeaking(false);
      setRobotMessage("Speech synthesis not available.");
    }
  };

  useEffect(() => {
    if (isRobotActive && isPathRenderable && path.length > 0) {
      // Only restart narration if speech is not active OR if the path content has actually changed.
      if (!speechStateRef.current.isSpeakingInternal || 
          !pathsAreEqual(speechStateRef.current.currentPathForSpeech, path)) {
        // console.log("[Speech useEffect] Path changed or not speaking. Restarting narration.");
        // console.log("Old path for speech:", speechStateRef.current.currentPathForSpeech);
        // console.log("New path from memo:", path);
        stopSpeech();
        speechStateRef.current = {
          isSpeakingInternal: true,
          pathNodeIndex: 0,
          currentPathForSpeech: [...path], // Store a copy of the new path
          currentUtterance: null,
        };
        setIsUiSpeaking(true);
        narratePathStep();
      } else {
        // console.log("[Speech useEffect] Path content is the same and speech active. Not restarting.");
      }
    } else if ((!isRobotActive || !isPathRenderable) && speechStateRef.current.isSpeakingInternal) {
    //   console.log("[Speech useEffect] Robot not active or path not renderable. Stopping speech.");
      stopSpeech();
      speechStateRef.current = { isSpeakingInternal: false, pathNodeIndex: -1, currentPathForSpeech: [], currentUtterance: null };
      setIsUiSpeaking(false);
      if (!isRobotActive) setRobotMessage("Click me for directions!");
      else setRobotMessage("Please generate a path.");
    }
  }, [isRobotActive, isPathRenderable, path, navigationMode, usingSimulatedLocation]);

  const handleRobotClick = () => {
    const newActiveState = !isRobotActive;
    setIsRobotActive(newActiveState); 

    if (newActiveState) {
      if (isPathRenderable && path.length > 0) {
        // The useEffect will handle starting speech if necessary.
      } else {
        setRobotMessage("Please select a destination first.");
        speakText("Please select a destination first."); 
      }
    } else {
      stopSpeech();
      speechStateRef.current.isSpeakingInternal = false;
      setIsUiSpeaking(false);
      setRobotMessage("Click me for directions!");
    }
  };

  const handleStopSpeechButton = () => {
    if (speechStateRef.current.isSpeakingInternal) { stopSpeech(); speechStateRef.current.isSpeakingInternal = false; setIsUiSpeaking(false); setRobotMessage("Speech stopped by user.");}
  };

  const selectableRoomsAndNodes = useMemo(() => {
    const pointsToConsider = { ...classrooms };
    const filteredKeys = Object.keys(pointsToConsider).filter(key => !key.endsWith('_BLOCK') && !['GATES', 'SOLAR_POWER_POINT', 'BUS_PARKING_AREA', 'NCC_AREA_PLAYGROUND', 'WATER_HARVESTING_POINT'].includes(key));
    return filteredKeys.sort((a, b) => { const nameA = getNodeDisplayName(a, navigationMode, usingSimulatedLocation); const nameB = getNodeDisplayName(b, navigationMode, usingSimulatedLocation); return nameA.localeCompare(nameB); });
  }, [navigationMode, usingSimulatedLocation]);

  const handleSearch = (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      setSearchError('');
      return;
    }

    const results = selectableRoomsAndNodes.filter(room => {
      const displayName = getNodeDisplayName(room, navigationMode, usingSimulatedLocation).toLowerCase();
      return displayName.includes(term.toLowerCase());
    });

    if (results.length === 0) {
      setSearchError('Invalid room number or location not found');
    } else {
      setSearchError('');
    }

    setSearchResults(results);
    setShowSearchResults(true);
  };

  const handleSearchSelect = (selectedValue) => {
    setSelectedRoom(selectedValue);
    setSearchTerm('');
    setShowSearchResults(false);
  };

  return (
    <div id="root">
      <header className="app-header">
        <h1>BHARAT INSTITUTION OF ENGINEERING AND TECHNOLOGY</h1>
        <p>INTERACTIVE SITEMAP</p>
      </header>

      {geoError && <p className="text-red-500 text-center my-2">Geolocation Error: {geoError}</p>}
      {isUserOutOfBounds && <p className="text-red-500 text-center font-semibold my-2">Your current location is outside the campus map boundaries.</p>}

      <div className="input-controls-container">
        <div className="navigation-mode-selector input-controls">
          <label>
            <input type="radio" name="navigationMode" value="currentLocation" checked={navigationMode === 'currentLocation'} onChange={() => setNavigationMode('currentLocation')} />
            Use My Current Location {usingSimulatedLocation && navigationMode === 'currentLocation' && "(Simulated)"}
          </label>
          <label>
            <input type="radio" name="navigationMode" value="manualStart" checked={navigationMode === 'manualStart'} onChange={() => setNavigationMode('manualStart')} />
            Select Start Point Manually
          </label>
        </div>

        <div className="input-controls">
          {navigationMode === 'manualStart' && (
            <div className="control-group">
              <label htmlFor="manualStartRoomSelect">Starting From:</label>
              <select 
                id="manualStartRoomSelect" 
                value={manualStartRoom} 
                onChange={(e) => setManualStartRoom(e.target.value)} 
              >
                <option value="" disabled>Select a starting point</option>
                {selectableRoomsAndNodes.map((pointKey) => (
                  <option 
                    key={`start-${pointKey}`} 
                    value={pointKey} 
                    disabled={pointKey === selectedRoom}
                  >
                    {getNodeDisplayName(pointKey, navigationMode, usingSimulatedLocation)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="control-group destination-controls">
  <label htmlFor="destinationSearch">Select Destination:</label>
  <div className="search-select-container">
    <input
      type="text"
      id="destinationSearch"
      placeholder="Search destination..."
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        handleSearch(e.target.value);
      }}
      className="destination-search-input"
    />
    {searchError && <div className="search-error">{searchError}</div>}
    {showSearchResults && searchResults.length > 0 && (
      <ul className="search-results-list">
        {searchResults.map((room) => (
          <li
            key={room}
            onClick={() => handleSearchSelect(room)}
            className="search-result-item"
          >
            {getNodeDisplayName(room, navigationMode, usingSimulatedLocation)}
          </li>
        ))}
      </ul>
    )}
    <select
      id="destinationRoomSelect"
      value={selectedRoom}
      onChange={(e) => setSelectedRoom(e.target.value)}
      className="destination-select"
    >
      <option value="" disabled>Or select from list</option>
      {selectableRoomsAndNodes.map((pointKey) => (
        <option
          key={`dest-${pointKey}`}
          value={pointKey}
          disabled={pointKey === manualStartRoom && navigationMode === 'manualStart'}
        >
          {getNodeDisplayName(pointKey, navigationMode, usingSimulatedLocation)}
        </option>
      ))}
    </select>
  </div>
  {pathError && <div className="path-error">{pathError}</div>}
</div>
        </div>
      </div>

      <div className="map-wrapper">
        <div className="map-scroll-container" style={{ position: 'relative' }}>
          <svg viewBox="0 0 210 297" width="100%" className="isometric-map">
            <image href="/main_outline.svg" x="0" y="0" width="210" height="297" />
            {Object.keys(blockImages).map((blockKey) => {
              const coords = classrooms[blockKey];
              if (!coords || typeof coords.x !== 'number' || !blockImages[blockKey] || !blockImages[blockKey][0]) return null;
              return ( <g key={blockKey} className="landmark-g" onMouseEnter={(e) => handleLandmarkMouseEnter(blockKey, e)} onMouseLeave={handleLandmarkMouseLeave}><circle className="landmark-dot" cx={coords.x} cy={coords.y} r="3"/></g> );
            })}
            {navigationMode === 'currentLocation' && userSvgPos && typeof userSvgPos.x === 'number' && userSvgPos.x !== -1 && (
              <g className={usingSimulatedLocation ? "you-simulated-marker" : "you-marker"}><circle cx={userSvgPos.x} cy={userSvgPos.y} r="3.5" /><text x={userSvgPos.x + 6} y={userSvgPos.y - 4} > You {usingSimulatedLocation ? "(Simulated)" : ""}</text></g>
            )}
            {navigationMode === 'manualStart' && manualStartRoom && manualStartCoords && typeof manualStartCoords.x === 'number' && (
                 <g className="manual-start-marker"><circle cx={manualStartCoords.x} cy={manualStartCoords.y} r="3.5" /><text x={manualStartCoords.x + 6} y={manualStartCoords.y - 4} >Start: {truncateText(manualStartRoom, 10)}</text></g>
            )}
            {destination && typeof destination.x === 'number' && (
              <g className="destination-marker"><line className="pin-line" x1={destination.x} y1={destination.y} x2={destination.x} y2={destination.y - 4}/><circle className="pin-head" cx={destination.x} cy={destination.y} r="3.5" /><text x={destination.x + 6} y={destination.y - 4}>{truncateText(selectedRoom, 10)}</text></g>
            )}
            {isPathRenderable && path.map((node, index) => {
              if (path.length === 1 && node === startNodeForDijkstra && node === selectedRoom) {
                 const point = (node === 'YOU_ARE_HERE' && navigationMode === 'currentLocation') ? userSvgPos : (classrooms[node] || nodeCoordinates[node]);
                 if (!point || typeof point.x !== 'number' || point.x === -1) return null;
                 return <circle key="self-path-marker" cx={point.x} cy={point.y} r="2" fill="purple" stroke="white" strokeWidth="0.5"/>;
              }
              if (index === path.length -1) return null;
              const currentPoint = (node === 'YOU_ARE_HERE' && navigationMode === 'currentLocation') ? userSvgPos : (classrooms[node] || nodeCoordinates[node]);
              const nextNodeName = path[index + 1];
              const nextPoint = (nextNodeName === 'YOU_ARE_HERE' && navigationMode === 'currentLocation') ? userSvgPos : (classrooms[nextNodeName]  || nodeCoordinates[nextNodeName]);
              if (!currentPoint || typeof currentPoint.x !== 'number' || currentPoint.x === -1 || !nextPoint || typeof nextPoint.x !== 'number' || nextPoint.x === -1) {
                  return null;
              }
              return ( <line className="path-line" key={`${node}-${nextNodeName}-${index}`} x1={currentPoint.x} y1={currentPoint.y} x2={nextPoint.x} y2={nextPoint.y} markerEnd="url(#arrowhead)"/> );
            })}
            <defs> <marker id="arrowhead" markerWidth="3" markerHeight="2.1" refX="3" refY="1.05" orient="auto" className="path-arrowhead"><polygon points="0 0, 3 1.05, 0 2.1" /></marker></defs>
          </svg>
          {tooltipData && (
            <div className="html-landmark-tooltip" style={{position: 'absolute',top: `${tooltipData.coords.top + 10}px`,left: `${tooltipData.coords.left + 10}px`,transform: 'translate(0, 0)',pointerEvents: 'auto',zIndex: 1000}} onMouseEnter={handleTooltipContentMouseEnter} onMouseLeave={handleTooltipContentMouseLeave}>
              <div className="tooltip-image-scroller">{tooltipData.images.map((image, index) => (<img key={index} src={image} alt={`${tooltipData.blockKey} preview ${index + 1}`}/>))}</div>
              <div className="tooltip-caption">{roomNames[tooltipData.blockKey] || tooltipData.blockKey.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}</div>
            </div>
          )}
        </div>
      </div>

      <div className="buttons-container">
        <button onClick={() => setShowLegend(true)} className="legend-button">📘 Legend</button>
        <button onClick={togglePathDialog} disabled={!isPathRenderable} className="path-button">Show Path Steps</button>
      </div>

      <div
        className={`floating-robot-icon ${isRobotActive ? 'active' : ''} ${isPathRenderable ? 'has-path' : 'no-path'}`}
        onClick={handleRobotClick}
        title={isRobotActive ? "Click to hide assistant" : (isPathRenderable ? "Click for voice directions" : "Generate a path to activate assistant")}
      >
        <img src="/images/robot.png" alt="Navigation Assistant" />
        {isPathRenderable && !isRobotActive && <div className="robot-blinking-dot"></div>}
        {isRobotActive && (
          <div className="robot-expanded-content">
            <div className="robot-speech-bubble">
              {robotMessage}
            </div>
            {isUiSpeaking && (
              <button onClick={handleStopSpeechButton} className="robot-stop-speech-button">
                  Stop Speech
              </button>
            )}
          </div>
        )}
      </div>

      {showLegend && (
        <div className="legend-dialog-overlay" onClick={() => setShowLegend(false)}>
          <div className="legend-dialog" onClick={(e) => e.stopPropagation()}>
            <h2>📘 Map Legend</h2>
            <ul>
              <li><span className="you-marker-legend"></span> Your Current Location</li>
              <li><span className="you-simulated-marker-legend"></span> Your Simulated Location</li>
              <li><span className="manual-start-marker-legend"></span> Manual Start Point</li>
              <li><span className="destination-marker-legend"></span> Destination</li>
              <li>🛎️ - Reception</li> <li>⏳ - Waiting Hall</li> <li>🚹 - Men's Washroom</li> <li>🚺 - Women's Washroom</li>
              <li>🍽️ - Canteen</li> <li>🧱 - Stairs</li> <li>💧 - Water Filters</li>
              <li><b>----</b> - Walk pathway (Visual map line)</li>
              <li><svg width="20" height="10" style={{display: 'inline-block', verticalAlign: 'middle'}}><line x1="0" y1="5" x2="20" y2="5" style={{stroke: "var(--svg-path-stroke-dark, #22d3ee)"}} strokeWidth="2" markerEnd="url(#arrowhead)"/></svg> - Calculated Path</li>
            </ul>
            <button onClick={() => setShowLegend(false)} className="close-legend-button">Close</button>
          </div>
        </div>
      )}
      {showPathDialog && isPathRenderable && (
        <div className="path-dialog-overlay" onClick={() => setShowPathDialog(false)}>
          <div className="path-dialog" onClick={(e) => e.stopPropagation()}>
            <h2>Path from {getNodeDisplayName(startNodeForDijkstra, navigationMode, usingSimulatedLocation)} to {getNodeDisplayName(selectedRoom, navigationMode, usingSimulatedLocation)}</h2>
            <ol>{path.map((nodeKey, index) => ( <li key={index}>{getNodeDisplayName(nodeKey, navigationMode, usingSimulatedLocation)}</li> ))}</ol>
            <button onClick={() => setShowPathDialog(false)} className="close-path-button">Close</button>
          </div>
        </div>
      )}

      <p className="location-info"> </p>
      <p className="location-info">
        <strong>
          {navigationMode === 'currentLocation' ? (usingSimulatedLocation ? "Using Simulated Location" : "Live Coordinates") : "Manual Start Mode"}
        </strong>
        {navigationMode === 'currentLocation' && currentLocation?.latitude && typeof currentLocation.longitude === 'number' && ` → Lat: ${currentLocation.latitude.toFixed(6)}, Lon: ${currentLocation.longitude.toFixed(6)}`}
        <br />
        {navigationMode === 'currentLocation' && currentUserContext && ( <> Current User Context: <strong>{currentUserContext}</strong></> )}
        {navigationMode === 'manualStart' && manualStartRoom && ( <> Starting from: <strong>{getNodeDisplayName(manualStartRoom, navigationMode, usingSimulatedLocation)}</strong></> )}
        {selectedRoom && ( <> {(navigationMode === 'manualStart' && manualStartRoom) || (navigationMode === 'currentLocation' && currentUserContext) ? ' | ' : ''} Destination: <strong>{getNodeDisplayName(selectedRoom, navigationMode, usingSimulatedLocation)}</strong></> )}
      </p>
      <footer className="app-footer">
        <p>© 2025 BHARAT INSTITUTION. All rights reserved.</p>
        <p>Developed with ❤️ by Chitra and Co.</p>
      </footer>
    </div>
  );
};

export default App;

