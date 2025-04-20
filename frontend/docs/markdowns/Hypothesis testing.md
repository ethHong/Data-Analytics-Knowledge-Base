# Hypothesis Testing

**category_specifier** : "Statistics"

**Reference Docs:** [Linear Regression and Coefficient](Linear Regression and Coefficient.md)|[Omitted Variable Bias](Omitted Variable Bias.md) | [Standard Error](Standard Error.md)

## **Motivation**

- We want to test (or check) if our **estimator for some parameter is significant**

## **Use cases**

* We want to check **if mean of two groups are significantly different**

  **Application**: ***Is metric difference in two user group significantly different?***

* We want to check if **regression coefficient is statistically significant**

  **Application:**

  * Prediction model context: Checking significance of the model coefficients.
  * A/B testing (causal relationship) context: Checking if treatment effect coefficient is significant.

## **Framework**

### **Hypothesis setup**

- We have estimated value for the true value $\beta_1$, as  $\beta_{null}$
- We are checking if  $\beta_1$, and  $\hat{\beta_1}$ are ***close enough** (Similar)*

$$ H0 \text{ (Null Hypothesis)}: \beta_1 = \beta_{null} , \\ \text{or,} \quad \beta_1 - \beta_{null} = 0 $$

$$ H1 \text{ (Alternative Hypothesis)}: \beta_1 \neq \beta_{null}, \\ \text{or,} \quad \beta_1 - \beta_{null} \neq 0 $$

- Usually, when we are checking if treatment effect is significant (if $\beta_1$ is not 0), we set  $\beta_{null} = 0$

### **Interpretation**

- Since we don’t have enough clue (backup) to believe  $\beta_1$ value is significant, we start by assuming H0 (Null Hypothesis).
- If there are significant level of clue to believe  $\beta_1$ is not 0, then we reject null and take H1 (Alternative hypothesis)

## **Get t-statistic and run *T-test***

$$ t = \frac{\beta_1 - \beta_{null}}{s_{\beta_1}} $$

- Implication: Normalize gap between true value ($\beta_1$), and hypothesized value ($\beta_{null}$)
- Interpretation:
  - If $t$ is small, (or close to 0), it means hypothesized value ($\beta_{null}$, or 0) is close to the true value. **This means we have enough clue to take H0  (**$\beta_1$ is close to 0**)**
  - If  $t$  is large enough, it means $\beta_1$ is not likely to be 0, so we could reject null.

## **Significance level - deciding if $t$ is ‘large enough’**

1. Pick Significance Level $\alpha$: Probability of rejecting Null when it’s true
2. Get a critical value: $t^*_{N-2, \alpha/2}$ (1.96 when $\alpha$ = 95%)
3. Check if $t$ value deviates critical value range: If $t = |\frac{b_1 - \beta^1}{s_{b1}}| >t^*_{N-2, \alpha/2}$, then $t$ Is ‘large enough’** so we can reject null.

## **P-Value: ‘How small’ T should be?** 

- P value: $p = Pr(| t^*_{N-2, \alpha/2}| \geq |t|)$
  - Probability of **$t$ being smaller than critical value**
  - Probability of rejecting null, when $t$ Is large enough
  - Conclusion: Smaller P-value implies, $t$ is more likely to be large.

## **Rule of Thumb : P value < 0.05**

- In many cases we take 95% of critical value
- **Under 95% critical value, we can reject null under P value < 0.05**

## **Application**

### **Regression coefficient significance**

#### **Setting**

Assume we have estimated coefficient for Linear Regression ([Linear Regression and Coefficient](Linear Regression and Coefficient.md)

Where true line is:

$$ Y = β₀ + β₁X + ε $$

Estimated model is:

$$ Y = \hat{β₀} + \hat{β₁X} + \hat{ε} $$

#### **Hypothesis setting**

- We want to know if **X has significant effect on Y** based on the given data
- Therefore, we hypothesize if true value of $\beta_1 = \hat{\beta_1}= 0$, so here $\beta_{null} =0$

$$ Y = \hat{β₀} + \hat{β₁X} + \hat{ε} $$

$$ H0 \text{ (Null Hypothesis)}: \beta_1 = \beta_{null} , \\ \text{or,} \quad \beta_1 - \beta_{null} = 0 $$

$$ H1 \text{ (Alternative Hypothesis)}: \beta_1 \neq \beta_{null}, \\ \text{or,} \quad \beta_1 - \beta_{null} \neq 0 $$

#### **T-test**

- We can get t-statistic value from the trained linear model.

$$ t = \frac{\beta_1}{s_{\beta_1}} $$

- Compute P-value, and check if p-value is lower than 0.05

#### **Interpretation**

- If p-value for the coefficient is lower than 0.05, we can say the coefficient value is ‘statistically significant’.

- If the coefficient is not significant, we cannot trust the coefficient value, we cause we lack ground to say $\beta_1 \neq 0$.

- In this case, we say the precision if coefficient is low, (High standard error Standard Error). To increase precision:

  - Increase sample size $N$
  - Guarantee variation of the sample data $X$ ($Var(X)$)
  - Take more control variables ([Using control variables](Using Control Variables.md) ) / features into regression, to reduce variance of $e$ ( $s^2$ )

### **Comparison of two group’s statistical value (TBD)**

## **Takeaways and Important points.**

- When we reject null, we can say value of  $\beta_1$ is statistically significant, and trust the estimated coefficient value.

- Caution: It is not appropriate to say ‘True

   $\beta_1$ value is close to 0**’ when we don’t reject null**

  - More appropriate interpretation: ‘We cannot say $\beta_1$ is not 0 based on the current data, so cannot trust the coefficient. ’

