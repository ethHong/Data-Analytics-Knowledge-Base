document.addEventListener("DOMContentLoaded", async () => {
  // Fetch graph data
  const response = await fetch("http://localhost:8000/graph/");
  const graphData = await response.json();

  // Set graph dimensions
  const width = window.innerWidth * 1;
  const height = window.innerHeight * 1;

  // Create SVG container
  const svg = d3.select("#knowledge-graph")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", "#f5f5f5");

  // Enable zoom and pan
  const zoom = d3.zoom()
    .scaleExtent([0.1, 5])
    .on("zoom", (event) => {
      svgGroup.attr("transform", event.transform);
    });

  svg.call(zoom);

  const svgGroup = svg.append("g");

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // Force simulation for graph layout
  const simulation = d3.forceSimulation(graphData.nodes)
    .force("link", d3.forceLink(graphData.links).id((d) => d.id).distance(150))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2));

  // Draw links (edges)
  const link = svgGroup.append("g")
    .selectAll("line")
    .data(graphData.links)
    .enter()
    .append("line")
    .attr("stroke", "#aaa")
    .attr("stroke-width", 2);

  // Draw nodes
  const node = svgGroup.append("g")
    .selectAll("circle")
    .data(graphData.nodes)
    .enter()
    .append("circle")
    .attr("r", 12)
    .attr("fill", (d) => color(d.category))
    .call(
      d3.drag()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEnded)
    )
    .on("click", (event, d) => {
      window.location.href = `/markdowns/${d.id.replace(/\s+/g, "_")}.md`;
    });

  // Add labels
  const label = svgGroup.append("g")
    .selectAll("text")
    .data(graphData.nodes)
    .enter()
    .append("text")
    .attr("dy", -15)
    .attr("text-anchor", "middle")
    .text((d) => d.id);

  // Run simulation ticks
  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    label.attr("x", (d) => d.x).attr("y", (d) => d.y);
  });

  // Drag Functions
  function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  // Center Graph Button Functionality
  const centerButton = document.createElement("button");
  centerButton.textContent = "Center Graph";
  centerButton.style.position = "absolute";
  centerButton.style.top = "10px";
  centerButton.style.right = "10px";
  centerButton.style.padding = "10px";
  centerButton.style.backgroundColor = "#007bff";
  centerButton.style.color = "white";
  centerButton.style.border = "none";
  centerButton.style.borderRadius = "5px";
  centerButton.style.cursor = "pointer";
  document.getElementById("knowledge-graph").appendChild(centerButton);

  let initialCenterTransform = null; // Save the initial centering position

  // ✅ Save Initial Center Without Applying It
  initialCenterTransform = getGraphCenterTransform();

  // Center the graph only when button is clicked
  centerButton.addEventListener("click", () => {
    if (initialCenterTransform) {
      svg.transition()
        .duration(750)
        .call(zoom.transform, initialCenterTransform);
    }
  });

  // Calculate Center Transform and Add Padding
  function getGraphCenterTransform() {
    const graphBounds = svgGroup.node().getBBox();
    const padding = 50;

    const centerX = -graphBounds.x - graphBounds.width / 2 + width / 2;
    const centerY = -graphBounds.y - graphBounds.height / 2 + height / 2;

    return d3.zoomIdentity
      .translate(centerX - padding, centerY - padding)
      .scale(1);
  }
});
