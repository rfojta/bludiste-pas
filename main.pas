unit main;

interface

uses
  Windows, Messages, SysUtils, Variants, Classes, Graphics, Controls, Forms,
  Dialogs, Menus, ExtCtrls, DateUtils, ImgList, ComCtrls, CustomizeDlg;

type
  pinteger = ^integer;
  bun = boolean;
  ubun = ^bun;
  plocha = array [1..50,1..50] of bun;

  TBarvy = record
    tam, zpet, zdi, mino1, mino2: integer;
  end;
  PPrvek = ^TPrvek;
  TPrvek = object
                x,y: integer;
                barva: pinteger;
                dalsi: PPrvek;
                constructor init(_x,_y: integer;_barva: pinteger; kam: pprvek);
                procedure GetObsah(var _x,_y:integer;_barva: pinteger);
    procedure kresli;
    procedure posun;
  end;
  TFronta = object
        posledni,prvni:pprvek;
        constructor init;
        destructor done;
        procedure pridej(x,y: integer;barva: pinteger);
        procedure uber(x,y: integer;barva: pinteger); overload;
        procedure uber; overload;
        function jeprazdna: boolean;
  end;
  TForm1 = class(TForm)
    MainMenu1: TMainMenu;
    Projt1: TMenuItem;
    Generovat1: TMenuItem;
    Konec1: TMenuItem;
    Generovat2: TMenuItem;
    Prehoditminotaura1: TMenuItem;
    barvy: TColorDialog;
    Barvy1: TMenuItem;
    Zdi1: TMenuItem;
    Cestatam1: TMenuItem;
    Cestazpet1: TMenuItem;
    Minotaurus1: TMenuItem;
    Obrys1: TMenuItem;
    Vnitrek1: TMenuItem;
    Vyprazdnitbludiste1: TMenuItem;
    Timer1: TTimer;
    ukoncit1: TMenuItem;
    StatusBar1: TStatusBar;
    opendi: TOpenDialog;
    savedi: TSaveDialog;
    N1: TMenuItem;
    savelab: TMenuItem;
    openlab: TMenuItem;
    procedure Konec1Click(Sender: TObject);
    procedure Projt1Click(Sender: TObject);
    procedure Generovat1Click(Sender: TObject);
    procedure Prehoditminotaura1Click(Sender: TObject);
    procedure Zdi1Click(Sender: TObject);
    procedure Cestatam1Click(Sender: TObject);
    procedure Cestazpet1Click(Sender: TObject);
    procedure Obrys1Click(Sender: TObject);
    procedure Vnitrek1Click(Sender: TObject);
    procedure precti;
    procedure prectiCo(jmeno : string);
    procedure zapis;
    procedure ZapisCo(jmeno: string);
    procedure FormShow(Sender: TObject);
    procedure Vyprazdnitbludiste1Click(Sender: TObject);
    procedure Timer1Timer(Sender: TObject);
    procedure ukoncit1Click(Sender: TObject);
    procedure FormPaint(Sender: TObject);
    procedure FormDestroy(Sender: TObject);
    procedure FormMouseDown(Sender: TObject; Button: TMouseButton;
      Shift: TShiftState; X, Y: Integer);
    procedure FormMouseMove(Sender: TObject; Shift: TShiftState; X,
      Y: Integer);
    procedure FormCreate(Sender: TObject);
    procedure openlabClick(Sender: TObject);
    procedure savelabClick(Sender: TObject);
  private
    procedure PosunPero(x, y: integer);
    procedure Otoc(var co: boolean);
    procedure KdeClick(x, y,pomer: integer);
    function muze(x, y, smer: integer): boolean;
    procedure Chod(co: tpoint);
    procedure UkryjMinotaura;
    procedure Otevre(x,y,smer:integer);
    procedure NewGen;
    { Private declarations }
  public
    Fronta: tfronta;
    Puk: PPrvek;
    index: integer;
    edituji : boolean;
    c,d,cas:integer;
    barva : tbarvy; //hodnoty barev
    Soubor: File;
    Rozmer: integer;
    krajni : tlist;
    Pocet: integer;
    lab, bak, //bludiste a zaloha prazdneho bludiste
    vert,horiz:plocha; //horizontalni a vertikalni dvere v bludisti
    ukryt: tpoint; // misto ukryti minotaura
  published
    procedure najdi(x,y:integer;var jo:boolean);
    procedure Nakresli;
    procedure Spojcarou(x, y, barva: integer);
    procedure cara(x1,y1,x2,y2:integer);
    { Public declarations }
  end;

  { P R O M E N E}
var
    Form1: TForm1;

const
  krok : array [1..2,1..4] of integer = ((1,0,-1,0),(0,1,0,-1));
  datfile = 'lab.dat';

implementation

uses Types, rozmery, Spin;

{$R *.dfm}

function TForm1.muze(x,y,smer:integer):boolean;
begin
   case smer of
   1: if x=rozmer then muze:=false else muze:=not vert[x,y];
   3: if x=1 then muze:=false else muze:=not vert[x-1,y];
   2: if y=rozmer then muze:=false else muze:=not horiz[x,y];
   4: if y=1 then muze:=false else muze:=not horiz[x,y-1];
   end;
end;

procedure TForm1.Otevre(x,y,smer:integer);
begin
   case smer of
   1: if x<rozmer then vert[x,y]:=false;
   3: if x>1 then vert[x-1,y]:=false;
   2: if y<rozmer then horiz[x,y]:=false;
   4: if y>1 then horiz[x,y-1]:=false;
   end;
end;

Procedure TForm1.Chod(co : tpoint);
var i:integer;
begin
     inc(lab[co.x,co.y]);
     for i:=1 to 4 do
     if muze(co.x,co.y,i) and not(lab[co.x+krok[1,i],co.y+krok[2,i]])
     then chod(point(co.x+krok[1,i],co.y+krok[2,i]));
end;

{TFronta}

destructor TFronta.done;
begin
  while not jeprazdna do uber;
end;

constructor TFronta.init;
begin
  if not jeprazdna then done;
  new(posledni,init(1,1,0,nil));
  prvni:=posledni;
end;

function TFronta.jeprazdna: boolean;
begin
  jeprazdna:=prvni=nil;
end;

procedure TFronta.Pridej(x,y: integer;barva: pinteger);
begin
  posledni^.dalsi:=new(pprvek,init(x,y,barva,nil));
  posledni:=posledni^.dalsi;
end;

procedure TFronta.Uber(x,y:integer; barva: pinteger);
var pom : pprvek;
begin
  prvni.GetObsah(x,y,barva);
  pom:=prvni;
  prvni:=prvni^.dalsi;
  dispose(pom);
end;

procedure TFronta.Uber; //override;
var pom : pprvek;
begin
  pom:=prvni;
  prvni:=prvni^.dalsi;
  dispose(pom);
end;

Procedure TForm1.Spojcarou(x,y,barva:integer);
begin
  with Canvas do
  begin
     pen.color:=barva;
     LineTo((x-1)*c+c div 2,(y-1)*d+d div 2);
  end;
end;

Procedure TForm1.PosunPero(x,y:integer);
begin
    Canvas.MoveTo((x-1)*c+c div 2,(y-1)*d+d div 2);
end;

procedure TForm1.zapis;
begin
  assignfile(soubor,datfile);
  {$I-} rewrite(soubor,1); {$I+}
  If IOResult<>0 then begin
     Showmessage('Problem s diskem'#13'Soubor nejde zapsat');
     closefile(soubor);
     halt;
  end;
  blockwrite(soubor,rozmer,sizeof(rozmer));
  blockwrite(soubor,barva,sizeof(barva));
  blockwrite(soubor,horiz,sizeof(horiz));
  blockwrite(soubor,vert,sizeof(vert));
  closefile(soubor);
end;

procedure TForm1.precti;
begin
  If FileExists(datfile) then begin
    assignFile(soubor,datfile);
    reset(soubor,1);
    blockread(soubor,rozmer,sizeof(rozmer));
    blockread(soubor,barva,sizeof(barva));
    blockread(soubor,horiz,sizeof(horiz));
    blockread(soubor,vert,sizeof(vert));
    closefile(soubor);
  end
  else Generovat2.click;
end;

procedure TForm1.Konec1Click(Sender: TObject);
begin
  Application.Terminate;
end;

procedure TForm1.Nakresli;
  var i,j : integer;
  pom: pprvek;
begin
  c:=ClientWidth  div (rozmer);
  d:=(ClientHeight - statusbar1.Height) div (rozmer);
  with canvas do
  begin
    Brush.color:=form1.Color;
    FillRect(Rect(0,0,form1.Width,form1.height));
    Pen.Color:=barva.zdi;
    for i:=1 to rozmer-1 do for j:=1 to rozmer do
    begin
        if vert[i,j] then cara(i,j-1,i,j);
        if horiz[j,i] then cara(j-1,i,j,i);
    end;
    Brush.Color:=barva.zdi;
    FrameRect(rect(0,0,c*rozmer,d*rozmer));
    pen.Color:=barva.mino1;
    Brush.color:=barva.mino2;
    Ellipse((ukryt.x-1)*c,(ukryt.y-1)*d,ukryt.x*c,ukryt.y*d);
    moveto(c div 2,d div 2);
  end;
  if (not fronta.jeprazdna) then if ukoncit1.Enabled then
    begin
      pom:=fronta.prvni^.dalsi;
      for i:=1 to index do
      begin
        if i=1 then pom.posun else pom.kresli;
        pom:=pom^.dalsi;
      end
    end
    else begin
      puk:=fronta.prvni;
      puk.posun;
      puk:=puk.dalsi;
      while puk<>nil do
      begin
        puk.kresli;
        puk:=puk.dalsi;
      end;
    end;
end;

procedure TForm1.UkryjMinotaura;
begin
  ukryt:=point(random(rozmer)+1,random(rozmer)+1);
end;

procedure TForm1.Generovat1Click(Sender: TObject);
begin
  if form2.ShowModal = mrOk then begin
    rozmer:=form2.rozmerEdit.value;
    if rozmer>50 then rozmer:=50;
    if rozmer<4 then rozmer:=4;
    newgen;
    zapis;
    ukryjminotaura;
    nakresli;
    ukoncit1.Click;
    end;
end;

procedure TForm1.Projt1Click(Sender: TObject);
var potom: string;
  kod: boolean;
begin
  if projt1.caption = '&Pøerušit' then
  begin
    potom:='&Pokraèovat';
    timer1.Enabled:=false;
  end;
  if projt1.Caption='&Pokraèovat' then
  begin
    potom:='&Pøerušit';
    timer1.Enabled:=true;
  end;
  if projt1.Caption = '&Projít' then
  begin
    potom:='&Pøerušit';
    Ukoncit1.Enabled:=true;
    Ukoncit1.Visible:=true;
    fronta.init; lab:=bak; najdi(1,1,kod); //vytvorit frontu
    puk:=fronta.prvni; puk.posun;
    edituji:=false;
    index:=0;
    timer1.Enabled:=true;
    nakresli;
  end;
  projt1.Caption:=potom;
end;

procedure TForm1.Prehoditminotaura1Click(Sender: TObject);
begin
  ukryjminotaura;
  fronta.done;
  nakresli;
end;

procedure TForm1.Zdi1Click(Sender: TObject);
begin
  if barvy.Execute then barva.zdi:=barvy.Color;
  Nakresli;
end;

procedure TForm1.Cestatam1Click(Sender: TObject);
begin
  if barvy.Execute then barva.tam:=barvy.Color;
  Nakresli;
end;

procedure TForm1.Cestazpet1Click(Sender: TObject);
begin
  if barvy.Execute then barva.zpet:=barvy.Color;
  Nakresli;
end;

procedure TForm1.Obrys1Click(Sender: TObject);
begin
  if barvy.Execute then barva.mino1:=barvy.Color;
  Nakresli;
end;

procedure TForm1.Vnitrek1Click(Sender: TObject);
begin
  if barvy.Execute then barva.mino2:=barvy.Color;
  Nakresli;
end;

procedure TForm1.FormShow(Sender: TObject);
begin
  Randomize;
  cas:=30;
  with barva do begin
    tam:=clBlue;
    zpet:=clGreen;
    zdi:=clRed;
    mino2:=clPurple;
    mino1:=clPurple;
    end;
  Precti;
  form2.rozmerEdit.Value:=rozmer;
  UkryjMinotaura;
  Nakresli;
end;

procedure TForm1.Vyprazdnitbludiste1Click(Sender: TObject);
var i,j: integer;
begin
  for i:=1 to rozmer do for j := 1 to rozmer do
  begin
    vert[i,j]:=false;
    horiz[i,j]:=false;
  end;
  nakresli;
end;

procedure TForm1.Timer1Timer(Sender: TObject);
var l: integer;
  pom: pprvek;
begin
  inc(index);
  puk:=puk^.dalsi;
  if puk <> nil then //verze 5.1
  begin
    puk.kresli;
{  pom:=fronta.prvni^.dalsi; //verze 4.0
  if puk <> nil then
  for l:=1 to index do
  begin
     if l<index-4 then pom.posun else pom.kresli;
     pom:=pom^.dalsi; {}
{ if not fronta.jeprazdna then //verze vykreslovani 2.0
  begin
    fronta.uber(i,j,k);
    spojcarou(i,j,k); {}
  end else Ukoncit1.click;
end;

{ TPrvek }

procedure TPrvek.GetObsah(var _x, _y:integer; _barva: pinteger);
begin
  _x:=x;
  _y:=y;
  _barva:=barva;
end;

constructor TPrvek.init(_x, _y: integer; _barva: pinteger; kam: pprvek);
begin
   x:=_x;
   y:=_y;
   barva:=_barva;
   dalsi:=kam;
end;

procedure TPrvek.kresli;
begin
  form1.spojcarou(x,y,barva^);
end;

procedure TPrvek.posun;
begin
  form1.PosunPero(x,y);
end;

procedure TForm1.najdi(x,y:integer;var jo:boolean);
var p4: array [1..4] of 1..4; //permutace
    ok:boolean;
    i,j:integer;
begin
  inc(lab[x,y]); // oznaci navstivenou bunku
  for i:=1 to 4 do // vytvori nahodnou permutaci 1..4
    repeat
      p4[i]:=random(4)+1;
      ok:=true;
      if i>1 then
        for j:=i-1 downto 1 do
          if (p4[j] = p4[i]) then ok:=false;
    until ok;
  fronta.pridej(x,y,@barva.tam); //nakresli caru
  jo:=(ukryt.X = x) and (ukryt.y = y); //zjisti jestli neni u minotaura
  for i:=1 to 4 do //provadi pro vsechny ctyry smery
    if muze(x,y,p4[i])
       and not(lab[x+krok[1,p4[i]],y+krok[2,p4[i]]])
       and not(jo) then
    begin
      najdi(x+krok[1,p4[i]],y+krok[2,p4[i]],jo);
    // posle hledat do dalsich bunek
      if not(jo) then fronta.pridej(x,y,@barva.zpet);
    end;
end;

procedure TForm1.NewGen;
  function GoAndCrush(x,y:integer) : boolean;
  var p4: array [1..4] of 1..4; //permutace
      ok:boolean;
      i,j: integer;
  begin
    if (x in [1..rozmer]) and (y in [1..rozmer])
    and (not lab[x,y]) then begin
      GoAndCrush:=true;
      inc(lab[x,y]);
      for i:=1 to 4 do
        repeat
          p4[i]:=random(4)+1;
          ok:=true;
          for j:=i-1 downto 1 do
            if (p4[j] = p4[i]) then ok:=false;
        until ok;
      for i:=1 to 4 do
          if GoAndCrush(x+krok[1,p4[i]],y+krok[2,p4[i]])
          then otevre(x,y,p4[i]);
    end else goAndCrush:=false;
  end; // goAndCrush
var a,b: integer;
begin
  for a:=1 to rozmer do for b:=1 to rozmer do
  begin
    bak[a,b]:=false;
    if b<rozmer then horiz[a,b]:=random(10)>0;
    if a<rozmer then vert[a,b]:=random(10)>0;
  end;
  lab:=bak;
  GoAndCrush(1,1);
end;

procedure TForm1.ukoncit1Click(Sender: TObject);
begin
   timer1.Enabled:=false;
   projt1.Caption:='&Projít';
   Ukoncit1.Enabled:=false;
   Ukoncit1.Visible:=false;
   edituji:=true;
end;

procedure TForm1.cara(x1, y1, x2, y2: integer);
begin
  with canvas do begin
      moveto(x1*c,y1*d); lineto(x2*c,y2*d);
      end;
end;

procedure TForm1.FormPaint(Sender: TObject);
var l: integer; pom: pprvek;
begin
  Nakresli;
end;

procedure TForm1.FormDestroy(Sender: TObject);
begin
  fronta.done;
end;

procedure TForm1.KdeClick(x,y,pomer: integer);
  begin
    if (x mod c) < (c div pomer) then otoc(vert[x div c, y div d+1]);
    if (x mod c) > (c - c div pomer) then otoc(vert[x div c + 1, y div d+1]);
    if y mod d  < d div pomer then otoc(horiz[x div c+1, y div d]);
    if y mod d  > d - d div pomer then otoc(horiz[x div c+1, y div d + 1]);
  end;

procedure TForm1.FormMouseDown(Sender: TObject; Button: TMouseButton;
  Shift: TShiftState; X, Y: Integer);
begin
  if edituji then begin
      if ssRight in Shift then begin
        ukryt := point(x div c+1,y div d+1);
        fronta.done;
        nakresli;
        end;
      if ssLeft in Shift then kdeClick(x,y,4);
    end;
end;

procedure TForm1.Otoc(var co : boolean);
begin
  co:=not co;
  nakresli;
  fronta.done;
end;

procedure TForm1.FormMouseMove(Sender: TObject; Shift: TShiftState; X,
  Y: Integer);
begin
  if edituji then
  if ssLeft in Shift then kdeClick(x,y,d);
end;

procedure TForm1.FormCreate(Sender: TObject);
begin
  edituji:=true;
end;

procedure TForm1.openlabClick(Sender: TObject);
begin
  if opendi.Execute then begin
    prectiCo(opendi.filename);
    fronta.done;
    ukryjMinotaura;
    nakresli;
  end;
end;

procedure TForm1.prectiCo(jmeno: string);
begin
  assignFile(soubor,jmeno);
  reset(soubor,1);
  blockread(soubor,rozmer,sizeof(rozmer));
  blockread(soubor,barva,sizeof(barva));
  blockread(soubor,horiz,sizeof(horiz));
  blockread(soubor,vert,sizeof(vert));
  closefile(soubor);
end;

procedure TForm1.ZapisCo(jmeno: string);
begin
  assignfile(soubor,jmeno);
  rewrite(soubor,1);
  blockwrite(soubor,rozmer,sizeof(rozmer));
  blockwrite(soubor,barva,sizeof(barva));
  blockwrite(soubor,horiz,sizeof(horiz));
  blockwrite(soubor,vert,sizeof(vert));
  closefile(soubor);
end;

procedure TForm1.savelabClick(Sender: TObject);
begin
  if savedi.Execute then begin
    ZapisCo(savedi.filename);
  end;
end;

end.
