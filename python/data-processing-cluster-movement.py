import pandas as pd 
import numpy  as  np
df1 = pd.read_csv('MC1 Data New/park-movement-Sat.csv')
df2 = pd.read_csv('MC1 Data New/sat.csv')   
cluster_id_friday = []   
cluster_id_saturday = [] 
time = []           
print(len(df2))
for i in range(len(df1)):
    val = (df1.iloc[i]['id'])
    x = df2[df2['id'] == val]['kmeans'].iloc[0]
    cluster_id_friday.append(x)
    val = df1.iloc[i]['Timestamp']
    #print(type(val))
    final_val = val.split(' ')[1]
    time.append(final_val)
    #print(df2)
    print("************** end of iteration ********")
    print(i)
#print(cluster_id_friday)   
 
df1['cluster_id'] = cluster_id_friday
df1['Time'] = time
df1.drop(['Timestamp'], axis = 1)
df1.to_csv('cluster-movement-sat.csv', index=False)




