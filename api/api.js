export default function handler(req, res) {
  const expenses = req.body.expenses;

  let balance = {};

  expenses.forEach(e => {
    let per = e.amount / e.splitPeople.length;

    if (!balance[e.payer]) balance[e.payer] = 0;
    balance[e.payer] += e.amount;

    e.splitPeople.forEach(p => {
      if (!balance[p]) balance[p] = 0;
      balance[p] -= per;
    });
  });

  // 計算轉帳
  let creditors = Object.entries(balance).filter(([_,v]) => v>0);
  let debtors = Object.entries(balance).filter(([_,v]) => v<0);

  creditors.sort((a,b)=>b[1]-a[1]);
  debtors.sort((a,b)=>a[1]-b[1]);

  let transfers = [];

  let i=0,j=0;
  while(i<creditors.length && j<debtors.length){
    let amt = Math.min(creditors[i][1], -debtors[j][1]);

    transfers.push({
      from: debtors[j][0],
      to: creditors[i][0],
      amount: Math.round(amt)
    });

    creditors[i][1] -= amt;
    debtors[j][1] += amt;

    if(creditors[i][1]<1) i++;
    if(debtors[j][1]>-1) j++;
  }

  res.status(200).json({ transfers });
}