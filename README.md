# ZELKOVA
* Link: 🔗 https://zelkova.dev

<img width="1403" alt="Image" src="https://github.com/user-attachments/assets/ac37e044-1e93-43f9-9fd5-6e9a1584ed14" />

<img width="1405" alt="Image" src="https://github.com/user-attachments/assets/e6d88097-2c13-4da1-a9ff-2d9d965a6d9e" />

# Product Plans

## Summary
Knoweldge become only useful when they are shared, and connected to eachother. We aim to make a graph-based open knowledge base, in which we can easily look up how they are connected to eachother, and how should they be applied. We collect markdown documents and link them.

---

# PRD

## **Tech Stack**

### Dynamic Neo4j + MkDocs API (Real-Time View)

| Component           | Technology                                       |
| ------------------- | ------------------------------------------------ |
| Database            | Neo4j                                            |
| Static Site         | MkDocs                                           |
| Backend API         | FastAPI or Flask (to connect Neo4j to MkDocs UI) |
| Graph Visualization | D3.js / Neo4j Bloom                              |

- **MkDocs (frontend):** hosts a basic static site for documents.

- **Neo4j:** Store Markdown string.

  - Use python script to put .md files in directory, fetch them and store to Neo4j

- **Separate FastAPI/Flask backend :** Connects to Neo4j to get relationships dynamically.

- **D3.js : V**isualization of the document network graph, fetching links from Neo4j.

- Clicking a node in the graph opens the corresponding MkDocs document.

- Reference

  ✅ **Example API to Retrieve Relationships**

  ```python
  from fastapi import FastAPI
  from neo4j import GraphDatabase
  
  app = FastAPI()
  driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))
  
  @app.get("/related/{title}")
  def get_related_documents(title: str):
      with driver.session() as session:
          result = session.run(
              "MATCH (d:Document {title: $title})-[:REFERS_TO]->(related) RETURN related.title, related.file_path",
              title=title,
          )
          return [{"title": r["related.title"], "file_path": r["related.file_path"]} for r in result]
  
  ```

  ✅ **Example Frontend (D3.js Graph)**

  ```jsx
  fetch("/related/Linear Regression")
    .then(response => response.json())
    .then(data => {
        data.forEach(doc => {
            console.log(`Related: ${doc.title} - /${doc.file_path}`);
        });
    });
  
  ```

## Structure & Flow



![Image](https://github.com/user-attachments/assets/6168a6aa-5690-486c-a9d9-cee207960a26)

![Image](https://github.com/user-attachments/assets/59f0365f-530b-4165-b39d-5200402ea6dd)

### UI Preview

<img width="530" alt="Image" src="https://github.com/user-attachments/assets/94af1955-ecc3-441c-a516-397795b62f79" />

# Dev

## Setting

### Python virtual env

```bash
pipenv --python 3.10 
pipenv shell

pipenv install fastapi uvicorn neo4j mkdocs
pipenv install --dev black isort pylint
```

### Neo4j

```bash
# Setup neo4j
brew install neo4j
brew services start neo4j
brew services list

#brew services restart neo4j  # Restart
#brew services stop neo4j     # Stop

 neo4j-admin dbms set-initial-password <your password> #your_new_password, or
 cypher-shell -a bolt://localhost:7687 -u neo4j -p neo4j # and change pw
 
 python -c "from neo4j import GraphDatabase; driver = GraphDatabase.driver('bolt://localhost:7687', auth=('neo4j', 'PW')); print(driver.verify_connectivity())"
```

# DB Summary

- ```
  Document: Node
  ```

  - `title` → extracted from the filename
  - `content` → full text from the Markdown file
  - `category` → manually assigned or extracted later
  - `tags` → optional, for relationships

Example:

```bash
(:Document {title: "Regression Evaluation"}) -[:RELATED_TO]-> (:Document {title: "Parameter Estimation"})
```

### Nodes

| Property   | Type   | Description                       |
| ---------- | ------ | --------------------------------- |
| `title`    | String | Filename without extension        |
| `content`  | String | Full Markdown content             |
| `category` | String | e.g., "Statistics", "Programming" |
| `tags`     | List   | Optional keywords for search      |

### Relation

```
(:Document)-[:RELATED_TO]->(:Document)
```

- Only use 1 type of relation for simplicity.

### Neo4j POC

<img width="1327" alt="Image" src="https://github.com/user-attachments/assets/bdb20aac-8f2f-4f52-910f-15253232d08b" />

# Document management

## Document Categories V1

- Statistics 
  - Modeling
  - Standard Errors and evaluation of model
  - Simple Linear Regression
  - Multi-Linear Regression
  - Logistic Regression
  - Prediction, and Evaluation
- Advanced Analytics
  - Omitted Variable Bias (Selection Bias)
  - A/B Testing and Regression Analysis
- Machine Learning
  - Application of regression models
  - Boosting / Random Forrest
  - Neural Network
- Database
  - SQL
  - DBMS Basics 
- Optimization
