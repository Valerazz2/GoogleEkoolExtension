var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        for(let i = 0; i < mutation.addedNodes.length; i++)
        {
            var newNode = mutation.addedNodes[i];
            if(newNode.classList != undefined && newNode.classList.length > 0 && newNode.classList.contains("gradesheet"))
            {
                ///////////////////////////////
               showAverageMarks();
            }
        }
    })
});
observer.observe(document.documentElement, {
    attributes: true, childList: true, subtree: true
});

document.addEventListener('keydown', function(event){
    if(event.key === 'f' || event.key === 'F')
    {
        var element = getTableRows();
        element = element.getElementsByTagName('tbody')[0];
        fillMarks(element);
    }
});

function getTableRows()
{
    var gradesheet =  "fulltable gradesheet velvet-table gray-headers kov";
    var fullTable = document.getElementsByClassName( gradesheet)[0];

    var tHead = fullTable.getElementsByTagName('thead')[0].getElementsByTagName('tr')[1].getElementsByTagName('th')[1];
    tHead.innerHTML = 'Средний бал';

    var tBody = fullTable.getElementsByTagName('tbody')[0];
    return tBody.getElementsByTagName('tr');
}

function showAverageMarks()
{
    var tableRows = getTableRows();

    const gradesList = [];
    const dictionary = new Map();

    for(let i = 0; i < tableRows.length; i ++)
    {
        var elementTd = tableRows[i].getElementsByTagName('td')[2];
        var spans = elementTd.getElementsByTagName('span');

        let gradesString = ' ';
        
        for(let j = 0; j < spans.length; j++)
        {
            var deeperSpans = spans[j].getElementsByTagName('span');
            if(deeperSpans[0] == null) continue;
            gradesString += deeperSpans[0].getElementsByTagName('a')[0].innerText + ' ';
            deeperSpans[0].click;
            if(deeperSpans.length == 2)
            {
                gradesString += deeperSpans[1].getElementsByTagName('a')[0].innerText + ' ';
            }
        }
        gradesString = gradesString.replaceAll(',', '.');
        // str == h h B D 5.8 A 6.5 8.0 9.0 h h

        let {grade, letBonusGrade, apsentBonusGrade, isFloat} = calculateMarkFor(gradesString);
        if(isNaN(grade) || grade == null) continue;

        var finalStr = grade;
        grade = (+grade).toFixed(1);
        letBonusGrade = (+letBonusGrade).toFixed(1);
        apsentBonusGrade = (+apsentBonusGrade).toFixed(1);
        var sum = (+grade + +letBonusGrade + +apsentBonusGrade).toFixed(1);
        if(sum > 10) sum = 10;


        if((letBonusGrade > 0 || apsentBonusGrade > 0) && isFloat)
        {
            if(letBonusGrade > 0) finalStr += ' + ' + letBonusGrade + '(A, B)';
            if(apsentBonusGrade > 0) finalStr += ' + ' + apsentBonusGrade + '(p, h)';
            finalStr += ' => ' + sum;
        } 

        var tableData = tableRows[i].getElementsByTagName('td')[1];

        if(isFloat)
        {
            var btn = createButton(sum, dictionary);
            tableData.appendChild(btn);

            dictionary.set(dictionary.size, {sum, finalStr});
        }
        else
        {
            tableData.innerHTML = grade;
        }

        if(isFloat) gradesList.push(sum);
        else gradesList.push(grade);
        
    }
    displaySingleAvgGrade(gradesList, tableRows);
}

function createButton(sum, dictionary)
{
    var btn = document.createElement('button');
    btn.id = dictionary.size;
    btn.innerHTML = sum;

    btn.addEventListener('click', function(eventInfo){
        var currentElement = eventInfo.target;
        let keys = dictionary.get(currentElement.id);

        if(currentElement.innerHTML === keys.sum) currentElement.innerHTML = keys.finalStr;
        else currentElement.innerHTML = keys.sum;
    })

    return btn;
}

function displaySingleAvgGrade(gradesList, tableRows)
{
    var avgGrade = calculateAvg(gradesList);

    var tableHeader = document.createElement("th");
    tableHeader.innerHTML = 'Средний бал';

    var tableData = document.createElement("td");
    tableData.innerHTML = avgGrade.toFixed(1).toString();

    var tableBody = tableRows[0].parentNode;
    var newRow = tableBody.insertRow(tableBody.getElementsByTagName('tr').length);

    newRow.appendChild(tableHeader);
    newRow.appendChild(tableData);
}
 
function calculateAvg(list)
{
    let sum = 0;
    for(let i = 0; i < list.length; i++)
    {
        sum += +list[i];
    }
    return sum / list.length;
}


function calculateMarkFor(grades)
{
   let numGradeCount = 0;
   let sum = 0;
   var letBonusGrade = 0;
   var apsentCount = 0;
   var apsentBonusGrade = 0;
   var isFloat = false;
   const apsentChars = ['h', 'p', '-']
   for(var i = 0; i < grades.length; i++)
   {
       if (grades[i] >= '0' && grades[i] <= 9) 
       {
           let str = ' ';
           for (; grades[i] != ' '; i++)
           {
               str += grades[i];  
               if (i == grades.length - 1) break;        
           }
           sum += parseFloat(str);
           numGradeCount++;
           isFloat = str.includes('.');
       }
       if(grades[i] == 'M' && grades[i + 1] == 'a') numGradeCount++;
       else if (grades[i] == 'A' || grades[i] == 'B') {
           letBonusGrade += 0.1;
       }
       else if(grades[i] == 'C' || grades[i] == 'D'){
           letBonusGrade -= 0.1;
       }
       else if(apsentChars.includes(grades[i])) {
           apsentCount++;
       }
   }
   var grade = (sum / numGradeCount).toPrecision(3);
   grade = (+grade).toFixed(1);
   if(letBonusGrade < 0) letBonusGrade = 0;
   if(letBonusGrade > 0.5) letBonusGrade = 0.5;
   apsentBonusGrade = apsentCount > 4 ? 0 : 0.5;
   return {grade, letBonusGrade, apsentBonusGrade, isFloat};
}

function getRandomMark(){
    let rand = Math.floor(Math.random() * 5);

    if(rand >= 4){
        let randomNumber = Math.random() * 10;
        let rounded = randomNumber.toFixed(1);
        if(rounded < 7) {rounded = (+rounded) + 3};
        return rounded;
    }
    if(rand <= 3 && rand != 0){
        const letters = ["A", "B", "C", "D"];
        var randLet = letters[Math.floor(Math.random() * 4)];
        return randLet;
    }
    
    if(rand == 0)
    {
        const aps = ['h', 'p', '-'];
        let randAps = aps[Math.floor(Math.random() * 3)];
        return randAps;
    }
    return null;
}
function fillMarks(body)
{
    var rows = body.getElementsByTagName('tr');

    var marksCount = Math.floor(Math.random() * 6) + 5;
    for(let j = 0; j < rows.length; j++)
    {
        var currentTr = rows[j].getElementsByTagName('td')[2];
        console.log(currentTr);
        for(let i = 0; i < marksCount; i++)
        {
            let randMark = getRandomMark();
            var mySpan = document.createElement('span');
            mySpan.innerHTML = randMark;
           setColor(randMark, mySpan);
            
            var secondSpan = document.createElement('span');
            secondSpan.innerHTML = ' , ';
            secondSpan.style.color = 'black';
            mySpan.appendChild(secondSpan);
            currentTr.appendChild(mySpan);
        }
    }
}
function setColor(mark, mySpan)
{
    const goodMarks = ['A', 'B', 'h', 'p', '-',];
    if(goodMarks.includes(mark) || mark >= 5.0)
    {
        mySpan.style.color = '#6a8ac8';
    }
    else mySpan.style.color = '#e52c38';
}

