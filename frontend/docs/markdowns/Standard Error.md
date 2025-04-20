# Standard Error

**category_specifier** : "Statistics"

**Reference Docs:** [Hypothesis Testing](Hypothesis Testing.md)|[Using Control Variables](Using Control Variables.md)

## **Context**

- In A/B test, we want to improve the precision of the estimator for treatment effect (coefficient of the treatment variable)

  → Understand what affects the precision

- Standard Error is useful in understanding how reliable our sample statistic is as an estimator of the population parameter

  - Used to construct a confidence interval, which provides margin of error in our estimator
  - Used in the [Hypothesis Testing](https://www.notion.so/Hypothesis-Testing-1bebcb043bfc80a3902ae9ace3013f36?pvs=21)

## **Definition**

- Standard error measures standard deviation of the sampling distribution of a statistic (such as mean)
- It explains the accuracy of a sample statistic in representing the population parameter
  - Lower standard error → More precise sample statistic

**Example:** Standard Error of the Mean (SEM)

$$ SEM = \frac{s}{\sqrt{n}} $$

- Measures the standard deviation of sample means around the true population mean
- Relies on the two factors: 1) Sample Size 2) Sample Standard Deviation

## **Application**

### A/B Test: Estimate the true treatment effect using standard error of coefficient

Standard Error of the Regression Coefficient

$$ \widehat{SE}(\hat{\beta}_1) = \sqrt{\frac{s^2}{\sum_{i=1}^n (x_i - \bar{x})^2}} = \sqrt{\frac{s^2}{(N-1)s_x^2}} $$

- Measures the variability of the estimated regression coefficients if we were to repeatedly sample and run regressions
- It explains how close the estimated treatment effect (reflected in the regression coefficient) is to the true treatment effect
- Relies on the three factors:
  - To improve the precision of the coefficient estimator, we control these factors
    1. $N$ : Sample Size
    2. $s_x^2$ : Variability in X
    3. $s^2$ : Variance of regression residual
