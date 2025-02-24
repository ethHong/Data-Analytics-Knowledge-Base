document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("http://localhost:8000/graph/");
  const graphData = await response.json();

  const width = window.innerWidth * 1;
  const height = window.innerHeight * 1;

  const svg = d3.select("#knowledge-graph")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", "#f5f5f5");

  const zoom = d3.zoom()
    .scaleExtent([0.1, 5])
    .on("zoom", (event) => {
      svgGroup.attr("transform", event.transform);
    });

  svg.call(zoom);

  const svgGroup = svg.append("g");
  
  // 🎨 Assign unique colors by category
  const categories = Array.from(new Set(graphData.nodes.map(node => node.category)));
  const color = d3.scaleOrdinal()
    .domain(categories)
    .range(d3.schemeCategory10);

  const simulation = d3.forceSimulation(graphData.nodes)
    .force("link", d3.forceLink(graphData.links).id((d) => d.id).distance(150))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(30));

  const link = svgGroup.append("g")
    .selectAll("line")
    .data(graphData.links)
    .enter()
    .append("line")
    .attr("stroke", "#aaa")
    .attr("stroke-width", 2);

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
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget).transition().duration(200).attr("r", 16);
      showTooltip(event, d);
    })
    .on("mouseout", (event) => {
      d3.select(event.currentTarget).transition().duration(200).attr("r", 12);
      hideTooltip();
    })
    .on("click", (event, d) => {
      const docPath = `/markdowns/${d.id}`;
      window.location.href = docPath;
    });

  const label = svgGroup.append("g")
    .selectAll("text")
    .data(graphData.nodes)
    .enter()
    .append("text")
    .attr("dy", -15)
    .attr("text-anchor", "middle")
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
    document.body.appendChild(tooltip);
  }

  function hideTooltip() {
    const tooltip = document.getElementById("tooltip");
    if (tooltip) tooltip.remove();
  }

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

  setTimeout(() => {
    fitGraphToView();
  }, 300);
});
