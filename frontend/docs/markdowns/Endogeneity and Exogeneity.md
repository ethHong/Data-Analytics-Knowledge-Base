# Endogeneity and Exogeneity

**category_specifier** : "Causal Inference"

**Reference Docs: [Omitted Variable Bias](Omitted Variable Bias.md) | [Statistical Bias](Statistical Bias.md) | [Instrument Variable](Instrument Variable.md)

## **Motivation**

- Can I trust my regression to tell me about **causality**, or is something else interfering?
- Why does my coefficient change a lot when I add controls?

If **yes**, X is **exogenous** → good for causal inference.

If **no**, X is **endogenous** → need to fix it before interpreting causally.

## **What is Endogeneity?**

**Endogeneity** occurs when an explanatory variable (**X**) is **correlated with the error term** (**e**) in a regression:

$$ \text{Cov}(X, e) \neq 0 $$

This violates a core assumption of OLS regression and causes **biased and inconsistent estimates** of causal effects.

## **Why is this bad?**

Because OLS will **attribute part of the variation in Y to X**, when in fact that variation is **due to something else**, leading to misleading results.

## **Example Scenarios**

- **Price → Quantity Demanded**

  But prices are set in response to demand → **simultaneity**.

- **Education → Wages**, but **ability** affects both → **omitted variable**.

- **Health Insurance → Medical Spending**, but only sick people get insurance → **selection bias**.

## **Solutions for Endogeneity**

- **Instrumental Variables (IV)**: Find an instrument Z that affects X but is uncorrelated with e.
- **Randomized Experiments**: Ensure X is randomly assigned.
- **Panel Data / Fixed Effects**: Remove time-invariant unobserved variables.
- **Control Variables**: Include omitted confounders if observable.

## **What is Exogeneity?**

An explanatory variable (**X**) is **exogenous** when it is **not correlated** with the error term:

$$ \text{Cov}(X, e) = 0$$

This means X is "clean" - any effect of X on Y is **not confounded** by unobserved variables.

## **Key Equations**

Core technical concepts:

- **Exogeneity:** $Cov(X,u)=0$ or $E[u|X]=0$
- **Endogeneity:** $Cov(X,u)\neq0$

These conditions determine whether OLS estimates can be interpreted causally.

## **Endogeneity vs. Exogeneity**

|                    | **Endogeneity**                       | **Exogeneity**                      |
| ------------------ | ------------------------------------- | ----------------------------------- |
| **Cov (X, e)**     | ≠ 0 (violation of OLS assumption)     | = 0 (satisfies OLS assumption)      |
| **OLS Estimates**  | Biased & inconsistent                 | Unbiased & consistent               |
| **Typical Causes** | OVB, simultaneity, measurement error  | Random assignment or natural shock  |
| **Implication**    | Can't interpret coefficients causally | Can interpret coefficients causally |
| **Fixes**          | IV, RCTs, controls, FE, panel methods | No fix needed — already clean       |





