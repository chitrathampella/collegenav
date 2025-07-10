// src/utils/pathfinding.js
export const dijkstra = (graph, start, end) => {
  const distances = {};
  const previous = {};
  const queue = new PriorityQueue();

  // Initialization
  for (let node in graph) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[start] = 0;
  queue.enqueue(start, 0);

  while (!queue.isEmpty()) {
    const current = queue.dequeue();

    if (current === end) {
      break; // Found the shortest path
    }

    if (!graph[current]) {
      console.warn(`Node ${current} not found in graph`);
      continue;
    }

    for (let neighbor in graph[current]) {
      if (graph[current].hasOwnProperty(neighbor)) {
        const weight = graph[current][neighbor];
        const newDist = distances[current] + weight;

        if (newDist < distances[neighbor]) {
          distances[neighbor] = newDist;
          previous[neighbor] = current;
          queue.enqueue(neighbor, newDist);
        }
      }
    }
  }

  // Reconstruct path
  const path = [];
  let current = end;
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  return path;
};

class PriorityQueue {
  constructor() {
    this.elements = [];
  }

  isEmpty() {
    return this.elements.length === 0;
  }

  enqueue(item, priority) {
    this.elements.push({ item, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    return this.elements.shift().item;
  }
}