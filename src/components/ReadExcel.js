import React, { Component } from 'react';
import Xlsx from 'xlsx';
import './ReadExcel.css';

import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css

// 숫자 추출
function extractionNumber(str) {
    return str.replace(/[^0-9]/g,"");
}

// 문자 추출
function extractionString(str) {
    return str.replace(/[0-9]/gi,"");
}

function shuffle(a) {

    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

class ReadExcel extends Component {

    constructor(props) {
        super(props);

        this.state = { words: [], showRow: 0, question: {}, questionState: 'Q' };

        this.excelToJson = this.excelToJson.bind(this);
        this.startWordTest = this.startWordTest.bind(this);
        this.nextWord = this.nextWord.bind(this);
        this.confirmWord = this.confirmWord.bind(this);
    }

    excelToJson(e, files) {

        var rABS = true;

        var files = e.target.files, f = files[0];
        var reader = new FileReader();

        var that = this;

        reader.onload = function(e) {
            var data = e.target.result;
            if(!rABS) data = new Uint8Array(data);
            var workbook = Xlsx.read(data, {type: rABS ? 'binary' : 'array'});

            /* DO SOMETHING WITH workbook HERE */
            console.log(that.state);
            
            for(var sheet in workbook.Sheets) {
                
                for(var key in workbook.Sheets[sheet]) {
                    
                    var row = extractionNumber(key) - 1;
                    var col = extractionString(key);

                    if(col == 'A') {

                        if(that.state.words[row]) {
                            that.state.words[row].english = workbook.Sheets[sheet][key].h;
                        }
                        else {
                            that.state.words[row] = { english: workbook.Sheets[sheet][key].h, korea: '' };
                        }
                    }
                    else if(col == 'B') {

                        if(that.state.words[row]) {
                            that.state.words[row].korea = workbook.Sheets[sheet][key].h;
                        }
                        else {
                            that.state.words[row] = { english: '', korea: workbook.Sheets[sheet][key].h };
                        }
                    }
                }
            }
        };
        
        if(rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);
    }

    // 시험 시작
    startWordTest() {

        console.log('시험 시작');

        if(this.state.words.length <= 0) {
            alert('영어 단어를 업로드 하세요.');
            return;
        }

        shuffle(this.state.words);  // 단어 섞기
        
        this.nextWord();
    }

    nextWord() {
        console.log('다음 단어');
        

        if(this.state.words.length == this.state.showRow) {
            
            confirmAlert({
                title: '확인',
                message: '단어 시험이 끝났습니다. 다시 하시려면 시작 버튼을 누르세요.',
                buttons: [{
                    label: '확인',
                    onClick: () => { 

                        // 상태값 초기화
                        this.setState((state, props) => ({
                            showRow : 0,
                            question: {},
                            questionState: 'Q'
                        }));
                        return;
                        // this.startWordTest(); 
                    }
                }
                // , {
                //     label: '아니오',
                //     onClick: () => { return; }
                // }
                ]
            });
        }
        else {
            this.setState((state, props) => ({
                question: state.words[state.showRow],
                showRow : state.showRow+=1,
                questionState: 'Q'
            }));
        }
    }

    confirmWord() {
        this.setState({
            questionState: 'A'
        });
    }

    render() {

        let question;

        console.log(this.state.question.english, this.state.question.korea);

        if(this.state.question.english && this.state.question.korea) {
            question = (
                <div>
                    <div>{ this.state.question.english }</div>
                    <div className={ this.state.questionState == "Q" ? "hide" : "show" } >{ this.state.question.korea }</div>
                    <input type="button" value={ this.state.questionState == "Q" ? "확인" : "다음" } onClick={ this.state.questionState == "Q" ? this.confirmWord : this.nextWord } />
                </div>
            );
        }
        else {
            question = <div></div>;
        }

        return (
            <div>
                <div>
                    <input type="file" onChange={ (e) => this.excelToJson(e, e.target.files) } />
                    <input type="radio" name="abc" value="Y" checked={true} />단어/뜻
                    <input type="radio" name="abc" value="N" />뜻/단어
                    <input type="button" value="시작" onClick={ this.startWordTest } />
                    <input type="button" value="종료" />
                </div>
                <div id="area">
                    {question}
                </div>
            </div>
        );
    };

}

export default ReadExcel;