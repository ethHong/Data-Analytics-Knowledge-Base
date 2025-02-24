**category_specifier** : "Statistics"

**Reference Docs:** [Mean estimation and CLT](Mean estimation and CLT.md)

## Prediction Interval and Confidence Interval

**What is 95% prediction interval / 95% confidence interval?**

[![Confidence and Prediction Intervals with Statsmodels - GeeksforGeeks](https://media.geeksforgeeks.org/wp-content/uploads/20240807160121/Confidence-and-Prediction-Intervals.png)

* **95% Prediction interval:** In 95% probability, **our future observational data** fall in prediction interval. 
  * How real data is variating from true data, because of population STD ($\sigma_{Y}$)
* **95% Confidence interval:** If we repeatedly sample and compute confidence intervals, **95% of those intervals will contain the true population mean.**
  * How our model (estimation) would be close to the true value? Impacted by sample STD ($s_{Y}$)

### Prediction Interval

* Assuming we know true population mean $\mu$ and population STD $\sigma_{Y}$: 

$$
\begin{aligned}
&\mu \pm 1.96  * \sigma_{Y} \\
&\text{Where, } \hat{Y} = \text{Estimator} \\
&1.96 : \text{Critical value } (\text{ for 95 percent})
\end{aligned}
$$

* This is the prediction interval for a single future observation: For 95%, data will fall in this range.

* **Since population $\mu, \sigma_{Y}$** is unknown, we use:
  $$
  \bar{Y} \pm 1.96 * s_{Y} * \sqrt{1 + \frac{1}{n}}
  $$
  

### Confidence Interval

95% Confidence interval for an **estimation $\hat{Y}$** implies, if we repeat confidence interval from many sample data, 95% of them will include true value. (Narrower CI : Better precision of estimator.)

For [Mean estimator $\bar{Y}$ ]((1)Mean estimation and CLT.md), 95% confidence interval will be:
$$
\begin{aligned}
&\bar{Y} \pm t^* * \frac{s_{Y}}{\sqrt{n}} \\
&\text{Where, } \hat{Y} = \text{Estimator}, \\
& t = \text{Critical value } (1.96 \text{ for 95 percent})
\end{aligned}
$$
Because of [Central Limit Theorem.]((1)Mean estimation and CLT.md) $s_\bar{Y} = frac{s_Y}{sqrt{n}}$.

---

## Conclusion / Takeaways

* Confidence interval works as a measure of how estimator (mean estimation, or fitted model) is likely to be close to true value (true mean or true line)
* Prediction implies uncertainty in predicting a new individual future observation - how sample data will likely to be located around true value (true model or true line)
