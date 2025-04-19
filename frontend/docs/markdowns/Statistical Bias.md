# Statistical Bias

**category_specifier** : "Statistics"

**Reference Docs:** [Endogeneity and Exogeneity](Endogeneity and Exogeneity.md) | [Omitted Variable Bias](Omitted Variable Bias.md)

## **Motivation**

- Am I **missing variables** that affect both X and Y? (Omitted Variable Bias)
- Am I **measuring my variables accurately**? (Measurement Error)
- Is my sample **representative** of the population? (Selection Bias)
- Is treatment **assigned based on factors that also affect the outcome**? ([Endogeneity](Endogeneity and Exogeneity.md)) 

## **Definition**

**Statistical bias** is the **systematic difference** between the **expected value** of an estimator and the **true value** of the parameter it’s trying to estimate.

$$\text{Bias}(\hat{\theta}) = \mathbb{E}[\hat{\theta}] - \theta$$

Where:

- $\hat{\theta}$ is your estimator (ex - sample mean, regression coefficient)
- $\theta$ is the true population parameter

If the expected value of your estimator is **not equal** to the true value, the estimator is **biased**.

## **Why does it matter?**

Bias affects result reliability in data science. Ignoring it leads to flawed decisions in business, economics, and research.

## **Types**

### **Selection Bias**

Non-representative sampling of data, such as analyzing only satisfied customers.

### **[Omitted Variable Bias](Omitted Variable Bias.md)**

Excluding important variables from analysis, like studying education's impact on earnings without considering ability.

### **Measurement Bias**

Systematic errors in data collection from faulty instruments or biased questions.

## **How to Mitigate**

- **Randomization:** Use random sampling and A/B tests
- **Including Controls:** Add relevant variables to models
- **Proper Instrumentation:** Use accurate measurement tools
- **Awareness & Training:** Educate analysts on bias
- **Comprehensive Data:** Include both successes and failures
