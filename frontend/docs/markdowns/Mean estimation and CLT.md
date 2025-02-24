**category_specifier** : "Statistics"

**Reference Docs:** [Standard Error](Standard Error.md)

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

* $\bar{Y}$ is an estimator for $\mu$
* If $Y \sim N(\mu, \sigma)$, sum (or mean) of $Y$ have mean of $\mu$, and $\text{STD}$ of $\frac{\sigma^2}{N}$

**Implications**

If the sample size $n$ is large enough. Here, we see that the variance (or standard deviation) of our mean estimator is ***1) determined by the population variance, and 2) divided by sample size.*** 

1. With a larger sample size, our estimator (sample mean) will approximate to the population mean.
2. [Standard error]((3)Standard Error.md) also diminish, resulting in more precise estimation.
3. However, if the population standard deviation itself is large—meaning if $\sigma$ is large—there will be limitations to the precision of mean estimation. 

 **This is why we need large amounts of "BIG" data.**

## Why does diviging segment improve mean estimation?

* By defining segmented populations, **we can reduce the variance** of the population statistic. 
* Example: If we divide the "population" into different segments—e.g., by age group—it’s more likely that people within the same age group will have a similar range of income.

###  [ISLR Wage dataset](https://rdrr.io/cran/ISLR/man/Wage.html) Example

~~~R
install.packages("ISLR", repos = "http://cran.us.r-project.org")

library(ISLR)

# Load and view Wage dataset
data("Wage")
head(Wage)

# Divide Segment
df <- Wage[Wage$year == max(Wage[, 'year']), ]
df$age_group <- ifelse(df$age < 20, "Immature",
                       ifelse(df$age <= 30, "Twenties",
                              ifelse(df$age <= 60, "Middle aged",
                                     "Senior")))
df <- df[, c('age_group', 'wage')]
head(df)

# Visualize
hist(df$wage, main = paste("All age wage - variance:", round(var(df$wage), 2)), 
     xlab = "Wage", ylab = "Frequency")
# Immature
immature_age = df[df$age_group == "Immature", ]$wage
hist(immature_age, main = paste("Under 20 wage - variance:", round(var(immature_age), 2)), 
     xlab = "Wage", ylab = "Frequency")

#Twenties
twenties_age = df[df$age_group == "Twenties", ]$wage
hist(immature_age, main = paste("20~20 wage - variance:", round(var(twenties_age), 2)), 
     xlab = "Wage", ylab = "Frequency")

#Middle aged
middle_age = df[df$age_group == "Middle aged", ]$wage
hist(middle_age, main = paste("30~59 - variance:", round(var(middle_age), 2)), 
     xlab = "Wage", ylab = "Frequency")
~~~

<img width="759" alt="Screenshot 2024-11-08 at 11 10 04 PM" src="https://github.com/user-attachments/assets/a3f8bed9-186d-4a13-b61a-bc4e434a4cdb">

![image](https://github.com/user-attachments/assets/093d19c1-0441-4003-a3af-aa7894e7d676)

![image](https://github.com/user-attachments/assets/a10789bb-2bf6-4630-a798-2c7b2ce69567)

![image](https://github.com/user-attachments/assets/0021c2bf-30e7-467e-82dc-2b15144f2ed0)

![image](https://github.com/user-attachments/assets/58c42d6e-ed25-4619-97fe-6626e7be730d)
