**reference_docs: "Parameter_Estimation, test_stat_basics"**

This time, I will cover 'Linear Regression Model'. I know there are bunch of great resources on Linear Regression itself, so I will focus more on some of significant implications on Linear Regression, and some of the thoratical backgrounds behind methods we might have used without deeper understanding. Some of the questions answered would be:

* What does Linear Regression imply in terms of conditional prediction? (Why does it work better than mean estimation?)
* What are differences between just showing high correlation, and doing linear regression?
* What impacts accuracy of linear regression prediction? (Or, standard error?)
* Why do we do the log-scale? - Is it just because numbers are so large?

---

Last time, we have identified:

1. 'Modeling' impies finding out any kind of functions, that can describe and predict 'real world patterns'
2. Since it is impossible to get precise value of 'true patterns', we are using 'estimator' (e.g. Sample mean as an mean estimator, to estimate mean of population data.)
3. 'Standard Error' tell us about confidence interval of the 'true pattern' - e.g. even if we somehow identified 'true mean' of any elephants, if standard deviation is too large, mean would not help predicting future values 'with confidence'. 
4. So, ***knowing standard deviation is important***, but since we can't not figure out 'population standard deviation (std of true patterns)' we utilize sample standard deviation : ***'Standard Error'***. Smaller standard error implies, narrower confidence interval - which means we can use estimator to predict future value with 'more confidence'.

This time, let's look at one of the most widely used and important model - linear regression.

---

# Linear regression model - What is the 'correct' way to use them?

I think linear regression is one of the modeling method which is widely used, and many people will be used to it's concepts, formulation, or how to implement them in Python or R codes. ***However, it is more  important to implement them with better understanding.*** For any kind of data, that 'seems to have linear correlation' if we put them into the linear regression model, it gives some prediction. **However, to what extent could we trust this outcome?** What are the factors that impact accuracy of prediction based on linear regression?

---

From one of the previous post on [MLE (maximum likelihood estimator)](https://ethhong.github.io/statistics/datascience/2024/08/10/Reviewing-MLE-(Maximum-Liklihood-Estimator).html), we had looked into linear regression in terms of Bayesian approach.

**Recap:** We can interpret 'Likelihood' as: given the observation or data, how likely is the data coming from certain model? For instand, when we toss the coin 10 times and see head 2 times, it is more likely to think probability of getting head is lower than 50%. Here, if we say $\theta$ is probability of getting head, $L(\theta) = \theta^x(1-\theta)^{n-x}$ where $x = 2$. Likelihood will be maximized then $\theta$ is around 0.2. 

Like we see from the ilustration below, it is more likley to infer that the data below, are generated from 'true line' model A, rather than model B. The MLE approach tried to get a model which maximizes likelihood - and we found out that it is same as linear regression model with regularization. 

<img width="734" alt="image" src="https://github.com/user-attachments/assets/51f86905-d4a5-4451-abc7-5bc3becbb080">

This time, let's try to understand linear regresssion itself.

## Simple Linear regression - It's All About Conditional Prediction

<img width="500" alt="Screenshot 2024-11-23 at 4 39 24 PM" src="https://github.com/user-attachments/assets/21271fe0-3649-415d-89cd-412f1b0abcb6">

I love using easy examples, so let's keep using example of elephants. I think many of people are used to illustrations like above. Linear regression is modeling pattern between two (or more) variables. However, it is also important to understand that it is 'expanding prediction of $Y$ into conditional prediction given $X$.'<img width="500" alt="Screenshot 2024-11-23 at 4 45 47 PM" src="https://github.com/user-attachments/assets/72a9bd13-83e9-465a-9955-e93e18c95391">

Let's remove the X axis, projecting data toward Y axisd. Now we only have sample statistic data of 'weight', so the best predictor for weight of 'all elephants in the world' would be a sample mean - this is exactly same as the mean estimation we'd done form the previous post. However, when additional information 'Age' is given ($X$), we can intuitively see that our model coule be more precise. Why? because based on their age elephants tend to have different weight, but mean prediction does not reflect this information. If we split up group of elephants by range of their age group, we can see that their 'group mean' moves. 

<img width="500" alt="Screenshot 2024-11-23 at 4 53 46 PM" src="https://github.com/user-attachments/assets/871ebf80-b206-4b8d-95fc-3cf26c20966b">

**So, what is the conclusion here?** 

* Linear regression is a ***conditional perdiction***, predicting value of Y given that $X=x$, where $x$ is the value of data point.
* Also, we can recognize that 'linear regression' (or conditional prediction) is better than simple mean prediction when Y moves as X moves - which means, **X and Y are somehow 'correlated'.**

# Quick Review on Correlation and Covariance

Let's co back to statistic class for a momne. 'Covariance' measures how random variables X and Y moves together (increases, or decreases together.)
$$
Cov(X, Y) = \frac{\sum_i^{n}(X_i - \bar{X})(Y_i - \bar{Y})}{n}
$$
Have you thought of implication behind this formulation? Covariance is **high** when, for each of data points, value of x is far from the mean, value of your is also far from the mean. If deviation from mean is large for one variable, but small for the other variable, covariance will be canceled out. 

Look at the illustrations below. Two cases have same mean of X and Y, but only for the first case two variables are correlated. We could see that for the first case, as X deviates from the mean, Y also deviates from the mean. However, for the second case, for many data points Y value does not deviate from mean while X deviates from the mean.

<img width="500" alt="Screenshot 2024-11-23 at 4 53 46 PM" src="https://github.com/user-attachments/assets/b22c49b3-22ec-4b77-b9a3-f39cffd8fd56">
$$
Corr(X, Y) = \frac{Cov(X, Y)}{\sigma_X \sigma_Y}
$$
For sample correlation:
$$
Corr(X, Y)_{sample} = \frac{S_{XY}}{s_X s_Y}
$$


Correlation is basically computed by dividing Covariance, with each random variable's standard deviation. By doing this, we are standardizing covariance between the value of -1 and 1. Correlation seems to be representing linear relationship between random variables in some sense, but there is one problem: Correlation is ***unitless***, so we cannot use them for prediction of future value. For instance, if age and weight of elephants show **high correlation of 0.8**. What does this number 0.8 imply? It only shows 'how correlation is strong' as a relative metric, but does not tell us anything about 'how to predict weight, given age'. ***However, the correlation itself is related to the linear regression coefficient.***

# Linear regression and correlation

$Y = b_0 + b_1X$

---

Now, let's look at the linear regression model in detail. We are fitting a line on dataset by representing Y as linear function of X. $b_0$ and $b_1$ are two parameters that decides how to draw the line. Based on given data, what we are doing here is same as what we have done from the mean estimation: 

1. Assuming there are linear 'true line' that generated the data
2. Taking given data as sample, we are 'estimating' the 'true line' equation. 
3. If our estimated line seems to be appropriately accurate (which means, it shows small standard error), we can use this estimated line to predict unseen future value.

Values we are estimating will be $b_0$, and $b_1$. From our given dataset, the best estimator should have least square error, as we also mentioned from [this post](https://ethhong.github.io/statistics/datascience/2024/08/10/Reviewing-MLE-(Maximum-Liklihood-Estimator).html). I will skip how does Least Square Error solution is derived, but Least Square Solution is known as:
$$
b_1 = \frac{\sum_i^{N}(X_i - \bar{X})(Y_i - \bar{Y})}{\sum_i^{N}(X_i-\bar{X})^2} = \frac{s_{XY}}{s_X^2}
$$
$$
b_0 = \bar{Y} - b_1\bar{X}
$$



Doen't this look familiar? This is sample correlation multiplied by $s_Y$ over $s_X$
$$
Corr(X, Y)_{sample} \frac{s_Y}{s_X}
$$
This implies that:

* The regression coefficient (slope) is, ***adjusting (scaling) correlation into the unit of Y***: divided by STD of X and multiplied by STD of Y. 
* In linear regression, $b_1 = 0$ means two variables are not related, so we cannot predict Y with X. If correlation between X and Y is 0, this will make $b1$ also 0. ***This explains intuition that, linear regression model will only be valid if variables are correlated.***

## Two more insights on residual $e$, $\epsilon$, and Lease Square Error solution. 

### Least Square Solution

Least Square Solution is knows as: 
$$
b_1 = \frac{\sum_i^{N}(X_i - \bar{X})(Y_i - \bar{Y})}{\sum_i^{N}(X_i-\bar{X})^2} = \frac{s_{XY}}{s_X^2}
$$

And, $b_0 = \bar{Y} - b_1\bar{X}$

There are some more implication behind this. If we look at $b_0$ formula, and plug it into $Y  = b_0 + b_1X$, we can find out that this Least Square Solution must pass $(\bar{X}, \bar{Y})$.

 <img width="500" alt="Screenshot 2024-11-23 at 4 39 24 PM" src="https://github.com/user-attachments/assets/ea23aba3-dc9e-4d62-8117-9c3eb987e619">

### More abot residual, and error

Now, let's dive deep into $\epsilon$ and $e$. 

<img width="500" alt="Screenshot 2024-11-26 at 5 44 47 PM" src="https://github.com/user-attachments/assets/e28b0b1e-e2c7-4d98-b840-1fa363c86404">

From the illustration above, let's say that the 'Blue line' is the 'ideal true linear line' which describes linear relatioship between age and weight of all elephants in the worlds. We are trying to 'predict' the line, from the given data. **Here is a thing we need to keep in mind:*** *'**True line' itslef also has 'irreducible error', and we define this as $\epsilon$.*** 

Even we assume that the 'true line' is ideal line, it has error - unless all data points are exactly located on the true line. We call this 'irreducible error', because even we predict the true line precisely (which won't be possible, unless we have infinite data point) we cannot reduce this error. This is why we formulate 'true line as'

$Y = \beta_0 + \beta_1X + \epsilon$, and our prediction as $\hat{Y} = \beta_0 + \beta_1X + e$. Here are two important insights for residual for 'least square estimator':

1. **Mean of residual should be 0.** 
2. **Correlation between $e$ and $X$ should be 0. ($Corr(e, X) = 0$)**
3. **Correlation between $\hat{Y}$ and $e$ should be zero. (Since $\hat{Y}$ is dependent on $X$, if 2 is true, this is also true. )**

The first one seems to be more intuitive: If the regression model has 'least square error', sum of it's errors will be canceled out to be zero. How about the second one? **It implies 'Error should be consistent over entire range of X'.** 

### Decomposition of error term - SSE, SSR, TSS, and R Square

From the last post, we discussed that 'Variability' is important in measuring predictability (or accuracy) of the model (estimation). This is why we focus on variance, or standard error. **So, let's look at how could 'Variability of Y' be decomposed.**

We know that:

*  $\sum_{i=1}^Ne_i = 0$
* $corr(e, X) = 0$
* $corr(\hat{Y}, e) = 0$

Therefore, we can write 
$$
Var(Y) = Var(\hat{Y} + e) =  Var(\hat{Y}) + Var(e) + 2Cov(\hat{Y}, e) = Var(\hat{Y}) + Var(e)
$$
Here, 'variability of Y' is decompsed with variability of $\hat{Y}$ and variability of $e$. We discussed that 'error term' is related to 'irriducible error'. Therefore only the $Var(\hat{Y})$ is the variability related to the regression model we build - which, we can explain with our regression model. So, ***we may wish variability related to our regression will be higher that the irreducible error*** - cause that means our model explain huge part of the variances in $Y$, and our model fits better.

This is what 'R squre all about'

### Why R Square is not 'accuracy measure', but measure of 'fit'?

It is easy to be too obsessed with R Square, and misinterpret it as 'accuracy measure'. However, if we search the definition, R Square is defined as a **coefficient of determination**. This is the definition from [Wikipedia](https://en.wikipedia.org/wiki/Coefficient_of_determination): ***R Square is the proportion of the variation in the dependent variable that is predictable from the independent variable(s)***

We had seen that $Var(Y) = Var(\hat{Y}) + Var(e)$. Since sample variance of a random variable is $\frac{1}{n-1} \sum (x_i - \bar{x})$, we can rewrite the formulation as:
$$
\sum_{i=1}^N(Y_i - \bar{Y})^2 = \sum_{i=1}^N(\hat{Y_i} - \bar{Y})^2 + \sum_{i=1}^Ne_i^2
$$
These are the definition of TSS, SSR, SSE
$$
TSS = SSR + SSE
$$

---


$$
R^2 = \frac{SSR}{SST} = 1 - \frac{SSE}{SST}
$$

Now, do you see the intention, and motivation behind R Square? 

* R Square **does not answer the question** how is the model accurate?
* It **answers**: ***'How much of variability is explained by the model?'***

This is about 'goodness of fit', not about accuracy of prediction.

### Then, how do we evaluate accuracy? - Always Standard Error.

So, how do we evaluate the model in terms of the accuracy of prediction? We had done very similar thing for the mean estimation from the previous post - Standard Error. Only the different thing is that, this time we have 3 parametors:

* $\sigma_e$: Standard error of regression. We need to estimate, how large is the 'standard deviation' of residuals are. 
* $\beta_0$ and $\beta1$: We need to evaluate how is our estimated parameters distributed, and estimate their standard deviation through standard error of estimation. 

This is why I covered the concept of standard error in detail, [with simple example of mean estimation from the previous post.](https://ethhong.github.io/statistics/datascience/2024/11/01/DS-ML-Back-to-the-Basics-Series-1-Parameter-Estimation-and-Simple-Linear-Regression.html) Whatever we are estimating, what matters is 'standard deviation' - higher the standard deviation, it means that the 'range (interval)' that unseen future data could likely be located will be wider. For 95% confidence interval, 95% of data are located in estimated point $\pm 2\sigma$, so larger sigma will cause wider interval. <img width="500" alt="Screenshot 2024-11-26 at 6 11 55 PM" src="https://github.com/user-attachments/assets/0c3d955a-5b0c-4560-a48b-22c8a96c7c2a">

I won't go deep into the calculation details, but each of the standard errors could be induced as the following

* **$\sigma_e$:** We use sample standard deviation instead:
  $$
  \hat{\sigma_\epsilon}^2 = s^2 = \frac{1}{N-2}\sum_{i=1}^{N}e_i^2 = \frac{SSE}{N-2}
  $$

* **$\sigma_{\beta_1}$** We use sample standard deviation here too: 
  $$
  \hat{\sigma_{\beta_1{}}} = \sqrt{\frac{\sigma_{\epsilon}^2}{(N-1)s_x^2}} \approx \sqrt{Var(b_1)} = s_{b_1} = \sqrt{\frac{s^2}{(N-1)s_x^2}}
  $$
  

Don't worry about the computation, when we do the regression analysis with Python, or R, it will compute and give all the numbers. However, the thing we need to know is ***'Standard Error indicates how each of the estimated parameters are credible'***

* Lower SE for slope $b_1$ implies that, 'regression coefficient' for two variables are credible.
* Lower SE of regression means, if we make prediction based on the linear model, it is highly likely that actual value will be close enough to our predicted value!

# One More thing - What matters for low SE, and why does log-scale works? 

For the standard error $\hat{\sigma_\epsilon}^2$, there is similar imlication we saw from mean estimation problem: ***As we have larger sample size, the standard error will diminish.*** How about standard error of the slope coefficient?
$$
\sqrt{\frac{s_e^2}{(N-1)s_x^2}}
$$

* Numerator: Smaller sample standard deviation of **'errors'** will make standard error of the slope **smaller**. (This is not a standard deviation of the sample data, but standard deviation of sample 'error' - $\hat{\sigma_\epsilon}^2$)

This is one of the reasons why log-scaling work. Since log-scaling compress the scale of data, it helps reducing variability, when the value is too spread out. Log-scaling mitigates skewness and transforms data to fit linear assumptions better.

* Denominator:
  * **Larger sample** will make standard error of the slope **smaller**.
  * Larger standard deviation of $x$ will make standard error of the slope **smaller**.

All of the above seems intuitive, except for one thing - the last one. ***Isn't it better to have 'smaller' variance of the data?*** 

However, larger variance in $x$ implies having more 'various' data. **If X covers more wider range of values, we have more information.** 

## Wait, then how is the accuracy of 'prediction' with this model like?

Now we know how to evaluate our model, and what kind of factors impact these accuracies. However, the standard errors we had looked at are about 'errors' within the model - how far are data in general variating from the fitted line? How far is our predicted line, from the actual 'true line?'

Then, how do we measure the accuracy of 'point estimation', if we are estimating unseen future Y value given some X value? 

### Sampling Errors

When making prediction, we need to consider **Sampling Error.** This is because, our model only took 'sample' of data, not entire population (which is impossible) - so our estimator of $\beta_0, \beta_1$ use sample values, and we need to make adjustment for this. **We can decompose Prediction Error into 'sampling error' and irreducible error (from variaboility of Y, which is irrelevant to X. )**:
$$
e_f = \epsilon_f - Error_{sampling} = Y_f - b_0 - b_1X_f
$$
which could be decomposed as:
$$
 = \epsilon_f + (\beta_0 - \beta_1X_f) - (b_0 - b_1X_f)
$$
So, here the sampling error could be represented as:
$$
((b_0 - \beta_0) + (b_1 - \beta_1)X_f)
$$
which is error between 'estimated model and true line' parameters. Let's leave computation to the computer. The standard error of point estimation, $Var(\hat{Y})$ is computed as the following:
$$
S_{\text{pred}} = s \sqrt{1 + \frac{1}{N} + \frac{(X_f - \bar{X})^2}{(N-1)s_X^2}}
$$
Here, $s$ is standard error of regression, which is $\hat{\sigma_{\epsilon}}^2 = s^2 = \frac{1}{N-2} \sum_{i=1}^N e_i^2 = \frac{\text{SSE}}{N-2}$

So, how is the standard error decomposed?

- $s * 1$ which is variation of epsilon) is SE of regression, ***which is unrelated to X***
- $\frac{1}{N} + \frac{(X_f - \bar{X})^2}{(N-1)s_X^2}$ ***is the part which is related to X***

Here are 3 implications, which are similar to all other standard errors we had looked into. 

1. Larger N matters
2. Larger $S_x$ matters (More variability of sample data X)
3. ***As $X_f$ is far from $\bar{X}$ → larger S_pred***

Only the last one is the new intuition. Drawing an illustration of the plot actually helps more intuitively understanding why:

<img width="664" alt="Screenshot 2024-12-16 at 6 16 12 PM" src="https://github.com/user-attachments/assets/895d1913-7363-429c-89c0-37ea481e978a" />

Look at the green line, **X1** and **X2**, X2 is far from mean of X, and we can see how point estimation in X2 is more far from true value, compared to X1! (Remember,  Least Square Error estimator should pass through mean of X, and Y.)

---

Now we have covered what decides 'More Accurate' estimation. 

Based on these baselines, I will try to deal with Logistic Regression, and Multi-variate Regressions later.
