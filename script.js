var selectedImageNumber = "img"; //Çözülecek resmin adını tutan değişken.
var movements = []; //Puzzle karıştırılırken ya da oynanırken yapılan hareketlerin tutulduğu dizi. (Puzzle çözülürken kullanılacak)

$( document ).ready(function() {

    $(".button1").click(function(){ //Start butonuna bastığımda olan animasyonlar. Jquery UI kullanıldı.
        $("#panel1").hide("slide",1000,()=>{
            $("#panel2").show("slide",1000);
        });
    });

    $( ".images" ).click(function() { //Çözülmek istenen resim seçilirken gerçekleşenler.
        $( ".images" ).each(function( index, element ) { //Her bir resme tıklandığında önce bütün resimlerin borderı kaldırılıyor.
            $( element ).css( "border", "none" );
        });

        $(".buttoncontainer").css("display", "block"); //Continue butonunun resime tıklandığında görünür olması.

        $( this ).css( "border", "3px solid black" ); //Seçtiğim resmin belli olması için border verilmesi.
        selectedImageNumber = $(this)[0].children[0].id+".jpg"; //Seçilen resmin adının değişkene verilmesi.
    });

    $(".button2").click(function(){ //Continue butonuna tıklandığında gerçekleşenler.
        $("#panel2").hide("slide",1000,()=>{ //Resim seçme ekranının gidip puzzle ekranının gelmesi.
            $("#panel3").show("slide",1000);
        });

        $(".piece").each(function( index, element ) { //Puzzle parçalarının ilk pozisyonlarının ayarlanması.
            $(element).css("background-image", "url("+selectedImageNumber+")");
            $(element).attr("position",index);
            $(element).attr("correctPosition",index);
            $(element).css("left",10+((index)%3)*150);
            $(element).css("top",10+Math.floor(((index)/3))*150);
            $(element).css( "background-position-x", -((index)%3)*150);
            $(element).css( "background-position-y", -Math.floor(((index)/3))*150);
        });
        
    });

    $(".piece").click((e)=>{ //Puzzledaki parçalardan herhangi birine tıklandığında gerçekleşenler.
        var clicked=$(e)[0].currentTarget; //Tıklanan parçanın değişkene atanması.
        var emptySquare=FindEmptySquare(); //Boş olan karenin bulunması.
        var moveable=GetMoveable(); //Hareket edebilir olan parçaların bulunması.

        movements.push($(clicked).attr("position") + "-" + emptySquare); //Tıklanan parçanın ilk konumu ve sonraki konumunun diziye eklenmesi.

        if( moveable.find( m=>m == $(clicked).attr("position")) != undefined  ){ //Tıklanan parça hareket edebilir durumda ise hareketinin gerçekleştirilmesi.
            switch( $(clicked).attr("position") - emptySquare){
                case -3:
                    $(clicked).css("top",$(clicked).position().top+150);
                    $(clicked).attr("position",emptySquare);
                break;
                case 3:
                    $(clicked).css("top",$(clicked).position().top-150);
                    $(clicked).attr("position",emptySquare);
                break;
                case -1:
                    $(clicked).css("left",$(clicked).position().left+150);
                    $(clicked).attr("position",emptySquare);
                break;
                case 1:
                    $(clicked).css("left",$(clicked).position().left-150);
                    $(clicked).attr("position",emptySquare);
                break;
            }
        }
        if(Control() == true){ // Parça hareket ettikten sonra puzzle doğruluğu kontrolü. Doğruysa gerekli animasyonların yapılması.
            $("#solvebutton").css("display","none"); //Solve Puzzle Now yazısının gizlenmesi
            $("#select").css("display","none"); //Select : yazısının gizlenmesi
            $("#shuffleoption").css("display","none"); //Dropdown gizlenmesi
            $("#true").css("display","block"); //Congratulations yazısının gözükmesi.
            $("#restart").css("display","block"); //F5 to Restart yazısının gözükmesi
            $("#panel3").css("opacity","0.4"); //Opaklığın düşürülmesi.
            movements = []; //Hareketler dizisinin sıfırlanması.
        } 
    });
    
    $(".piece").mouseover(function(){ //Mouse puzzle üzerine geldiğinde hareket edebilir parçaların belirginleşmesi.
        var moveable = GetMoveable();

        $( ".piece" ).each(function( index, element ) {
            if(moveable.find( m=>m == $(element).attr("position")) == undefined){
                $(element).css("opacity", "0.4");
            }
        });
    });

    $(".piece").mouseout(function() { //Üstteki işlemin tam tersi.
        $( ".piece" ).each(function( index, element ) {
            $(element).css("opacity", "1");
        });
    });

    $("#shuffleoption").change(function(){ //Karıştırma miktarı değiştiğinde Shuffle butonunun gözükmesi.
        $("#shufflebutton").css("display", "block");
    });

    $("#shufflebutton").click(function(){ //Shuffle butonuna tıklandığında puzzle'ın karışması.
        var prevPiece=null;
        var number = $("#shuffleoption").val(); //Karıştıma miktarının value değerinden alınması
        if(number != 0)
        {
            var interval = 0;
            if(number == 3) interval = 500; // Animasyon hızının karıştırma miktarına göre belirlenmesi.
            else interval = 300;
            MovePiece(number,interval);

            //Gerekli yazıların gizlenmesi olayları.
            $("#shuffleoption").css("display","none");
            $("#select").css("display","none");
            $("#shufflebutton").css("display","none");
        }
        else
        {
            alert("Lütfen karıştırma miktarı seçiniz...");
        }
    });

    $("#solvebutton").click(function(){ //Solve Puzzle Now butonuna tıklandığında çözme işleminin başlaması.
        $("#solvebutton").css("display","none");
        SolvePuzzle(movements.length);
    });

    $(document).keyup(function(e) { //ESC tuşuna basıldığında puzzle'ın çözülmesi.
        if (e.key === "Escape") {
            if(Control() != true) //Oyun başlamadan önce veya bittikten sonra ESC tuşuna basılırsa uyarı verilmesi.
            {
                $("#solvebutton").css("display","none");
                SolvePuzzle(movements.length);
            }
            else{
                alert("Oyun başlamadan önce veya bittikten sonra puzzle çözülemez...");
            }
       }
   });
});

function FindEmptySquare(){ //Boş olan karenin bulunması işlemi.
    var squares=[];
    $( ".piece" ).each(function( index, element ) { //Puzzledaki parçaların pozisyonlarının önce bir diziye atılması.
        squares.push($(element).attr("position"));
    });
    for(var i=0;i<9;i++){ //0'dan 9'a kadar olan pozisyonlardan dizinin içinde olmayan sayının bulunması.
        if(squares.find(x=>x==i)==undefined) return i; //Bulunan sayı boş karenin pozisyonu olduğu için bu değer döndürülür.
    }
}

function Control(){ //Puzzle'ın doğru olup olmadığını kontrol edilmesi.
    var correct = true;

    //Bütün parçaların pozisyonları olması gereken pozisyonlarıyla aynıysa correct değişkeni true olarak kalır ve puzzle doğru olur.
    $( ".piece" ).each(function( index, element ) {
        if($(element).attr("position") != $(element).attr("correctPosition")){
            correct = false;
            return correct;
        }
    });
    return correct;
}

function GetMoveable(){ //Hareket edebilir olan parçaların belirlenmesi.
    var emptySquare=FindEmptySquare();
    var moveable=[];
    if(emptySquare == 5 || emptySquare == 2){
        moveable.push(emptySquare-1,emptySquare-3,emptySquare+3);
        moveable=moveable.filter((x)=> x<9 && x>=0);
    } 
    else if(emptySquare == 6 || emptySquare == 3){
        moveable.push(emptySquare+1,emptySquare-3,emptySquare+3);
        moveable=moveable.filter((x)=> x<9 && x>=0);
    }
    else {
        moveable.push(emptySquare-1,emptySquare+1,emptySquare-3,emptySquare+3);
        moveable=moveable.filter((x)=> x<9 && x>=0);
    }
    return moveable;
}

var prevPiece=null; //Bir önceki hareket eden parçanın tutulacağı değişken.
function MovePiece(counter,interval){ //Parçaların gelen değer kadar karıştırılması.
    if(counter > 0){
        setTimeout(function(){ //Parçaların hareket ederken birbirlerini beklemesi için kullanıldı.
          counter--;

          var emptySquare=FindEmptySquare();
          var moveable=GetMoveable();
          var rnd=Math.floor((Math.random() * moveable.length)); //Hareket edecek olan parçanın random olarak belirlenmesi.
          var piece = $(".piece[position="+moveable[rnd]+"]");

          while($(prevPiece).attr("id")==$(piece).attr("id")){ //Aynı parçanın üst üste hareket ettirilmemesi için yapılan kontrol.
              rnd = Math.floor((Math.random() * moveable.length));
              piece = $(".piece[position="+moveable[rnd]+"]");
          }
          prevPiece=piece; //Hareket ettirilen parçanın değişkene atanması.
              
          movements.push($(piece).attr("position") + "-" + emptySquare); //Hareket eden parçanın hareketinin diziye eklenmesi.
         
          switch( $(piece).attr("position") - emptySquare){ //Parçanın konumunun değiştirilmesi.
              case -3:
                  $(piece).css("top",$(piece).position().top+150);
                  $(piece).attr("position",emptySquare);
              break;
              case 3:
                  $(piece).css("top",$(piece).position().top-150);
                  $(piece).attr("position",emptySquare);
              break;
              case -1:
                  $(piece).css("left",$(piece).position().left+150);
                  $(piece).attr("position",emptySquare);
              break;
              case 1:
                  $(piece).css("left",$(piece).position().left-150);
                  $(piece).attr("position",emptySquare);
              break;
          }

        MovePiece(counter,interval); //Fonksiyonun rekürsif olarak çağırılması.
        }, interval); // interval parçaların hareket etme hızı.
      }
      if(counter == 0) $("#solvebutton").show("fade",1000); // Karıştırma işlemi bittikten sonra Solve Puzzle Now butonunun gözükmesi.
}

function SolvePuzzle(counter){ //Toplam hareket sayısını parametre olarak alan ve puzzle'ı çözen method.
    if(counter > 0){
        setTimeout(function(){
            counter--;

            var piece1 = movements[counter].split('-')[0]; //Son hareket eden parçanın ilk konumu.
            var piece2 = movements[counter].split('-')[1]; //Son hareket eden parçanın son konumu.

            var piece = $(".piece[position="+piece2+"]");  //Hareket ettirilecek parça.
            
            switch( $(piece).attr("position") - piece1){ //Parçanın gerekli yere hareket ettirilmesi.
                case -3:
                    $(piece).css("top",$(piece).position().top+150);
                    $(piece).attr("position",piece1);
                break;
                case 3:
                    $(piece).css("top",$(piece).position().top-150);
                    $(piece).attr("position",piece1);
                break;
                case -1:
                    $(piece).css("left",$(piece).position().left+150);
                    $(piece).attr("position",piece1);
                break;
                case 1:
                    $(piece).css("left",$(piece).position().left-150);
                    $(piece).attr("position",piece1);
                break;
            }
            movements.pop(counter); //Hareket tamamlandıktan sonra hareketin diziden çıkarılması.
            SolvePuzzle(counter);
        }, 500);
      }
      if(counter == 0) // Çözme işlemi bittikten sonra dropdown'ın yeniden gözükmesi.
      {
          $("#shuffleoption").css("display","block");
          $("#select").css("display","block");
      }
}