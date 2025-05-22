document.addEventListener("DOMContentLoaded", async () => {
  //const response = await fetch("http://localhost:8000/graph/");
  const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  const baseURL = isLocal ? "http://localhost:8000" : "https://zelkova.dev";
  
  try {
    const response = await fetch(`${baseURL}/graph/`);
    const graphData = await response.json();

  } catch (error) {
    console.error("Graph fetch failed:", error);
  }

  // Create a container for the graph that fills the available space
  const graphContainer = document.getElementById("knowledge-graph");
  graphContainer.style.position = "absolute";
  graphContainer.style.top = "0";
  graphContainer.style.left = "0";
  graphContainer.style.width = "100%";
  graphContainer.style.height = "100%";
  graphContainer.style.zIndex = "0"; // Place graph behind content

  // Ensure the main content floats above the graph
  const mainContentElement = document.getElementById("main-content");
  if (mainContentElement) {
    mainContentElement.style.position = "relative";
    mainContentElement.style.zIndex = "1"; // Place content above graph
    mainContentElement.style.backgroundColor = "transparent"; // Make background transparent
  }

  const svg = d3.select("#knowledge-graph")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", "transparent"); // Make background transparent

  // Add touch event handling
  const zoom = d3.zoom()
    .scaleExtent([0.1, 5])
    .on("zoom", (event) => {
      svgGroup.attr("transform", event.transform);
    });

  // Enable both mouse and touch zoom
  svg.call(zoom)
    .on("touchstart", function(event) {
      event.preventDefault();
    })
    .on("touchmove", function(event) {
      event.preventDefault();
    });

  const svgGroup = svg.append("g");
  
  // 🎨 Assign unique colors by category using a darker palette to match the black theme
  const categories = Array.from(new Set(graphData.nodes.map(node => node.category)));
  const color = d3.scaleOrdinal()
    .domain(categories)
    .range(d3.schemeDark2);

  // Adjust force simulation parameters for mobile
  const isMobile = window.innerWidth < 768;
  const simulation = d3.forceSimulation(graphData.nodes)
    .force("link", d3.forceLink(graphData.links).id((d) => d.id).distance(isMobile ? 100 : 150))
    .force("charge", d3.forceManyBody().strength(isMobile ? -200 : -300))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(isMobile ? 20 : 30));

  const link = svgGroup.append("g")
    .selectAll("line")
    .data(graphData.links)
    .enter()
    .append("line")
    .attr("stroke", "#aaa")
    .attr("stroke-width", isMobile ? 1.5 : 2);

  const node = svgGroup.append("g")
    .selectAll("circle")
    .data(graphData.nodes)
    .enter()
    .append("circle")
    .attr("id", (d) => d.id)
    .attr("r", (d) => (isMobile ? 8 : 12) + (graphData.links.filter(link => link.source.id === d.id || link.target.id === d.id).length * (isMobile ? 1.5 : 2)))
    .attr("fill", (d) => color(d.category))
    .call(
      d3.drag()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEnded)
    )
    .on("mouseover touchstart", (event, d) => {
      event.preventDefault();
      const currentSize = parseFloat(d3.select(event.currentTarget).attr("r"));
      d3.select(event.currentTarget).transition().duration(200).attr("r", currentSize * 1.5);
      highlightConnections(d, true);
      showTooltip(event, d);
    })
    .on("mouseout touchend", (event, d) => {
      event.preventDefault();
      const currentSize = parseFloat(d3.select(event.currentTarget).attr("r"));
      d3.select(event.currentTarget).transition().duration(200).attr("r", currentSize / 1.5);
      resetConnections();
      hideTooltip();
    })
    .on("click touchend", async (event, d) => {
      event.preventDefault();
      console.log("Clicked node:", d.id);
      handleNodeClick(event, d);
    });

  const label = svgGroup.append("g")
    .selectAll("text")
    .data(graphData.nodes)
    .enter()
    .append("text")
    .attr("dy", isMobile ? -12 : -15)
    .attr("text-anchor", "middle")
    .attr("font-size", isMobile ? "10px" : "12px")
    .text((d) => d.id);

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    label.attr("x", (d) => d.x).attr("y", (d) => d.y);
  });

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

  function highlightConnections(nodeData, highlight) {
    link.attr("stroke", (d) => {
      return d.source.id === nodeData.id || d.target.id === nodeData.id ? (highlight ? "#000000" : "#aaa") : "#aaa";
    }).attr("stroke-width", (d) => {
      return d.source.id === nodeData.id || d.target.id === nodeData.id ? (highlight ? (isMobile ? 3 : 4) : (isMobile ? 1.5 : 2)) : (isMobile ? 1.5 : 2);
    });

    node.style("opacity", (d) => {
      return d.id === nodeData.id || graphData.links.some(link => (link.source.id === nodeData.id && link.target.id === d.id) || (link.target.id === nodeData.id && link.source.id === d.id)) ? 1 : 0.2;
    })
    .transition().duration(200)
    .attr("r", (d) => {
      const currentSize = parseFloat(d3.select(`[id='${d.id}']`).attr("r"));
      if (d.id === nodeData.id) return currentSize * 1.5;
      return highlight && (graphData.links.some(link => (link.source.id === nodeData.id && link.target.id === d.id) || (link.target.id === nodeData.id && link.source.id === d.id))) ? currentSize * 1.1 : currentSize * 0.8;
    });
  }

  function resetConnections() {
    link.attr("stroke", "#aaa").attr("stroke-width", isMobile ? 1.5 : 2);
    node.style("opacity", 1).transition().duration(200).attr("r", (d) => (isMobile ? 8 : 12) + (graphData.links.filter(link => link.source.id === d.id || link.target.id === d.id).length * (isMobile ? 1.5 : 2)));
  }

  function showTooltip(event, d) {
    const tooltip = document.createElement("div");
    tooltip.id = "tooltip";
    tooltip.innerHTML = `<strong>${d.id}</strong><br>Category: ${d.category}`;
    tooltip.style.position = "absolute";
    tooltip.style.left = event.pageX + 10 + "px";
    tooltip.style.top = event.pageY + 10 + "px";
    tooltip.style.background = "#fff";
    tooltip.style.border = "1px solid #ddd";
    tooltip.style.padding = "5px";
    tooltip.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
    tooltip.style.zIndex = 10;
    tooltip.style.fontSize = isMobile ? "12px" : "14px";
    document.body.appendChild(tooltip);
  }

  function hideTooltip() {
    const tooltip = document.getElementById("tooltip");
    if (tooltip) tooltip.remove();
  }

  // Add responsive center button
  const centerButton = document.createElement("button");
  centerButton.textContent = "Center Graph";
  centerButton.style.position = "absolute";
  centerButton.style.top = "10px";
  centerButton.style.right = "10px";
  centerButton.style.padding = isMobile ? "8px" : "10px";
  centerButton.style.backgroundColor = "#000000";
  centerButton.style.color = "white";
  centerButton.style.border = "none";
  centerButton.style.borderRadius = "5px";
  centerButton.style.cursor = "pointer";
  centerButton.style.zIndex = "2";
  centerButton.style.fontSize = isMobile ? "12px" : "14px";
  document.getElementById("knowledge-graph").appendChild(centerButton);

  centerButton.addEventListener("click", () => {
    fitGraphToView();
  });

  function fitGraphToView() {
    const bounds = svgGroup.node().getBBox();
    const fullWidth = bounds.width + 100;
    const fullHeight = bounds.height + 100;
    const midX = bounds.x + bounds.width / 2;
    const midY = bounds.y + bounds.height / 2;

    const scale = 0.9 / Math.max(fullWidth / width, fullHeight / height);
    const translate = [width / 2 - scale * midX, height / 2 - scale * midY];

    svg.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    svg.attr("width", newWidth).attr("height", newHeight);
    fitGraphToView();
  });

  setTimeout(() => {
    fitGraphToView();
  }, 300);
});

// Function to handle node click
function handleNodeClick(event, d) {
    // Prevent default behavior
    event.preventDefault();
    console.log("Clicked node:", d.id);
    
    // Graph nodes are now public (no authentication required)
    // Post message to parent window to open panel
    window.parent.postMessage({ type: "openPanel", docId: d.id }, "*");
}
