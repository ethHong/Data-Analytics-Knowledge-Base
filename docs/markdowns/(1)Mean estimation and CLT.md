~~~JSON
{reference_docs: ["Standard Error"]}
~~~

## Mean estimation and CLT

### Simple Mean Estimator

Best (Reasonable) Predictor for statistics: ***Mean***

* Best predictor random variable $Y_f$ woul be $\mu$
* We assume normat distribution $N(\mu, \sigma^2)$ for simplification.

### Population and sample parameter

* Population parameter: ($\mu, \sigma$)
* Sample parameter (estimator of population data):  ($\bar{Y}, s_Y$)

**We are estimating population parameter through sample data** $(\mu, \sigma) \sim (\bar{Y}, s_Y)$

* Sample Mean: $\bar{Y} = \frac{1}{n}\sum_{i=1}^{N}Y_i$
* Sample $STD$: $s_Y = \sqrt{\frac{1}{n-1}\sum_{i=1}^{N}(Y_i - \bar{Y})^2}$

<img width="585" alt="Screenshot 2024-11-07 at 2 43 31 PM" src="https://github.com/user-attachments/assets/be4dc335-990a-4d56-b239-89c898b4081d">

**Takeaway:** 'Modeling' is building a function which take sample data, gives estimator of population statistics. Even sample mean could be a model for estimation. 

## Accuracy of estimation

* Accuracy of estimator \bar{Y} depends on **$\sigma$**

- Small **sigma** ($\sigma$) lead to more homogeneous population

$$
\sigma \sim s_Y = \sqrt{\frac{1}{n-1}\sum_{i=1}^{N}(Y_i - \bar{Y})^2}
$$

### Central Limit Theorem

$$
\bar{Y} \sim N(\mu, \frac{\sigma^2}{N})
$$

* \bar{Y} is an estimator for \mu
* If $Y \sim N(\mu, \sigma)$, sum (or mean) of $Y$ have mean of $\mu$, and $STD$ of $\frac{\sigma^2}{N}$

**Implications**

If the sample size $n$ is large enough. Here, we see that the variance (or standard deviation) of our mean estimator is ***1) determined by the population variance, and 2) divided by sample size.*** 

1. With a larger sample size, our estimator (sample mean) will approximate to the population mean.
2. Standard error also diminish, resulting in more precise estimation.
3. However, if the population standard deviation itself is large—meaning if $\sigma$ is large—there will be limitations to the precision of mean estimation. 

 **This is why we need large amounts of "BIG" data.**
