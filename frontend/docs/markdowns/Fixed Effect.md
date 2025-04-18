# Fixed Effect

**category_specifier** : "Causal Inference"

**Reference Docs:** [Difference in Difference](Difference in Difference.md) | [Omitted Variable Bias](Omitted Variable Bias.md)

## **Motivation**

**Do I think unobserved, stable traits are driving both my treatment and outcome?**

If **yes**, and you have panel data - **fixed effects** is your friend.

## **Definition**

In panel data analysis, a **Fixed Effects model** gives each entity its own intercept term to capture time-invariant characteristics. It includes both **unit fixed effects** for entities and **time fixed effects** for period-specific factors.

Fixed effects regression analyzes **within-entity variation**: how changes in an entity over time relate to changes in predictors. Each entity acts as its **own control**, accounting for permanent characteristics like a store's location or size.

The model equation for two-way fixed effects is:

$Y_{it} = \alpha_i + \lambda_t + \beta X_{it} + \epsilon_{it}$

where $α_i$ is the entity fixed effect and λt is the time fixed effect.

Unlike **random effects models**, fixed effects don't assume entity differences are random. This approach controls for **"all unobserved heterogeneity that is constant over time"** without measuring it directly.

## **Why It Matters / Motivation**

Fixed effects help address omitted variable bias in panel data by controlling for unobserved characteristics that are constant over time **without directly observing them**.

Fixed effects are crucial in **difference-in-differences ( [Difference in Difference]()** analysis, allowing comparison of treated and control groups while accounting for baseline differences and time trends.

Key benefits:

- They **eliminate bias from unobserved, time-invariant factors**, making our coefficient estimates closer to causal.
- They allow us to use **within-unit variation**, focusing on changes rather than levels.
- They handle panel data questions naturally by analyzing **changes within an entity**.

## **Examples**

- **Sales → Ad spending**, but each **store** has its own baseline popularity → include **store fixed effects**.
- **Test scores → Class size**, but some **students** are naturally high-performing → use **student fixed effects**.
- **Policy change → Employment**, but each **state** has a fixed culture of regulation → include **state fixed effects**.

## **How Fixed Effects Are Implemented and Interpreted**

Fixed effects models use dummy variables for each entity and time period (minus one reference).

In interpretation, coefficients show the effect of a variable on Y while controlling for time-invariant entity differences. For example, in a store fixed effects model, a price coefficient shows how changes in price affect sales within the same store over time.

Key considerations include **degrees of freedom** (N-1 dummies for N entities) and **within R-squared** vs overall R-squared. While fixed effects control for time-invariant factors, they don't guarantee causality - time-varying confounders may still exist.

## **Who Uses Fixed Effects**

- **Economists/Academics:** Used extensively in empirical research, especially for wage gaps and health outcomes
- **Policy Analysts:** Evaluate program effects across regions over time
- **Data Scientists:** Analyze user behavior, A/B tests, and customer patterns
- **Financial Analysts:** Study firm performance and market trends
- **Educational Researchers:** Control for school-level differences in student outcomes

Fixed effects methods may appear under different names in industry, such as "categorical embeddings" in machine learning or "entity encoders" in deep learning.

