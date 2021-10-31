import React, { useEffect, useState } from 'react';

import { Button } from '@chakra-ui/react';
import { Wrap } from '@chakra-ui/layout';

import { bfs, dfs, recursiveBacktracking, eller, prim } from 'algorithms';

import {
  addEdge,
  buildNodeKey,
  findDirection,
  getNodeElements,
  getNodeKey,
} from './helpers';

import {
  possibleNeighbourCoords,
  DIRECTIONS,
  MAZE_TYPES,
  initialNodes,
} from './constants';

export default function GraphVisualizer() {
  const [nodeElements, setNodeElements] = useState([]);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [adjacencyList, setAdjacencyList] = useState();
  const [mazeType, setMazeType] = useState();

  const handleSetVisitedNodes = (visited) => {
    setVisitedNodes(visited);
  };

  useEffect(() => {
    // This function runs only once; we build the graph here
    const deepClone = new Map();
    initialNodes.forEach((node) => {
      deepClone.set(getNodeKey(node), node);
    });

    initialNodes.forEach((node) => {
      const { row, col } = node.coords;
      const { x, y } = possibleNeighbourCoords;

      for (let i = 0; i < x.length; i += 1) {
        const neighbourKey = buildNodeKey(row + x[i], col + y[i]);

        if (deepClone.has(neighbourKey)) {
          addEdge(...[node.maze, deepClone.get(neighbourKey)]);
        }
      }
    });

    const nodeElementsArray = getNodeElements(deepClone, mazeType);
    setNodeElements(() => [...nodeElementsArray]);
    setAdjacencyList(deepClone);
  }, []);

  useEffect(() => {
    // We use this function to upgrade the graph when it is traversed
    if (visitedNodes.length) {
      const deepClone = new Map();
      adjacencyList?.forEach((value, key) => deepClone.set(key, value));

      visitedNodes.forEach((node) => {
        const { row, col } = node.coords;
        const { x, y } = possibleNeighbourCoords;

        for (let i = 0; i < x.length; i += 1) {
          const neighbourKey = buildNodeKey(row + x[i], col + y[i]);

          if (deepClone.has(neighbourKey)) {
            const next = deepClone.get(neighbourKey);

            // the difference in coordinates shows use the direction of the neighbour
            const xDirection = next.coords.row - node.coords.row;
            const yDirection = next.coords.col - node.coords.col;

            const direction = findDirection(xDirection, yDirection);
            const { north, east, south, west } = node.walls;

            // We only add an edge if there is no wall between the 2 neighbours
            if (
              (direction === DIRECTIONS.NORTH && !north) ||
              (direction === DIRECTIONS.EAST && !east) ||
              (direction === DIRECTIONS.SOUTH && !south) ||
              (direction === DIRECTIONS.WEST && !west)
            ) {
              addEdge(...[node, next]);
            }
          }
        }
      });

      const nodeElementsArray = getNodeElements(deepClone, mazeType);
      setNodeElements(() => [...nodeElementsArray]);
      setAdjacencyList(deepClone);
    }
  }, [visitedNodes]);

  const startPoint = () => {
    const deepClone = new Map();
    adjacencyList?.forEach((value, key) => deepClone.set(key, value));

    const startNode = deepClone.get('0-0');

    startNode.controlState.isStart = true;
    setNodeElements(() => [...getNodeElements(deepClone, mazeType)]);
    setAdjacencyList(deepClone);
  };

  const endPoint = () => {
    const deepClone = new Map();
    adjacencyList?.forEach((value, key) => deepClone.set(key, value));

    const startNode = deepClone.get('5-25');

    startNode.controlState.isEnd = true;
    setNodeElements(() => [...getNodeElements(deepClone, mazeType)]);
    setAdjacencyList(deepClone);
  };

  return (
    <>
      <Wrap
        style={{
          width: 1080,
          paddingBottom: 25,
        }}
      >
        {nodeElements}
      </Wrap>
      <Button
        colorScheme="teal"
        onClick={startPoint}
        style={{ marginRight: 10 }}
      >
        SetStart
      </Button>

      <Button colorScheme="teal" onClick={endPoint} style={{ marginRight: 10 }}>
        SetEnd
      </Button>

      <Button
        colorScheme="teal"
        onClick={() =>
          dfs(adjacencyList, adjacencyList.get('0-0'), handleSetVisitedNodes)
        }
        style={{ marginRight: 10 }}
      >
        DFS
      </Button>

      <Button
        colorScheme="teal"
        onClick={() =>
          bfs(adjacencyList, adjacencyList.get('0-0'), handleSetVisitedNodes)
        }
        style={{ marginRight: 10 }}
      >
        BFS
      </Button>

      <Button
        colorScheme="teal"
        onClick={() => {
          setMazeType(MAZE_TYPES.BACKTARCKING);
          recursiveBacktracking(
            adjacencyList,
            adjacencyList.get('0-0'),
            handleSetVisitedNodes,
          );
        }}
        style={{ marginRight: 10 }}
      >
        Recursive Backtracking
      </Button>

      <Button
        colorScheme="teal"
        onClick={() => {
          setMazeType(MAZE_TYPES.ELLER);
          eller(adjacencyList, handleSetVisitedNodes);
        }}
        style={{ marginRight: 10 }}
      >
        Eller's Algorithm
      </Button>

      <Button
        colorScheme="teal"
        onClick={() => {
          setMazeType(MAZE_TYPES.PRIM);
          prim(adjacencyList, handleSetVisitedNodes);
        }}
      >
        Prim's Algorithm
      </Button>
    </>
  );
}
