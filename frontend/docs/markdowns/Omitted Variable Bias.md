# Omitted Variable Bias

**category_specifier** : "Causal Inference"

**Reference Docs:** [Statistical Bias](Statistical Bias.md) | [Endogeneity and Exogeneity](Endogeneity and Exogeneity.md) | [Frisch Waugh Theorem](Frisch Waugh Theorem.md) | [Instrument Variable](Instrument Variable.md) | [Hypothesis Testing](Hypothesis Testing.md) | [Using control variables](Using Control Variables.md)

## **Motivation**

💡**What happens if we forget to control for something important?** **Is there a third variable that affects both X and Y?**

## **When does OVB arise?**

- When a relevant variable is:

  - **Omitted from the regression**, and
- **Correlated with both** the explanatory variable **X** and the outcome **Y** where **Z** is the omitted variable.

$$
\text{Bias} = \text{Cov}(X, Z) \cdot \text{Effect of Z on Y}
$$

## **Definition**

**Omitted Variable Bias (OVB)** is a form of [statistical bias](https://www.notion.so/Statistical-Bias-1c5bcb043bfc808495fbe03e4a34b8a5?pvs=21) that occurs when a key variable is excluded from a regression model, causing its effect to be **wrongly attributed** to other variables.

## **Why It Matters**

OVB compromises our ability to identify true cause-and-effect relationships. When we **omit a confounding variable**, we risk drawing false conclusions about relationships between variables. This can lead to **incorrect decisions** in business and analytics. Understanding OVB reminds us that **correlation is not causation** and helps us identify potential hidden factors affecting our analysis.

## **How to Address OVB**

Here are four ways to address omitted variable bias:

- **Add [Controls](Using Control Variables.md):** Include omitted variables in the regression.
- **[Fixed Effects](Fixed Effect.md):** Control for time-invariant or entity-invariant factors using panel data.
- **[Instrumental Variables](Instrument Variable.md):** Use variables that affect X but not the error term.
- **Randomized Trials:** Use A/B tests to ensure treatment independence.

Combining these methods often works best to make variables more exogenous.

## **Examples**

- **Education → Income**, but we omit **ability** → upward bias.
- **Ad spending → Sales**, but we omit **seasonality** → spurious correlation.
- **Police presence → Crime rates**, but we omit **neighborhood risk** → distorted effect.

## **Key Equations**

The bias in a coefficient estimate when omitting variable Z is:

$$ Bias(\tilde{\beta}_1) \approx \beta_2 \cdot \frac{Cov(X,Z)}{Var(X)} $$

This shows bias depends on Z's effect ($\beta_2$) and its correlation with X. The exogeneity assumption $E[u|X]=0$ is violated when important variables are omitted.
