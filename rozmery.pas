unit rozmery;

interface

uses
  Windows, Messages, SysUtils, Variants, Classes, Graphics, Controls, Forms,
  Dialogs, StdCtrls, Spin, Buttons, ExtCtrls;

type
  TForm2 = class(TForm)
    Label1: TLabel;
    rozmerEdit: TSpinEdit;
    okbtn: TBitBtn;
    cancelbtn: TBitBtn;
    Button1: TButton;
    procedure FormCreate(Sender: TObject);
    procedure rozmerEditKeyDown(Sender: TObject; var Key: Word;
      Shift: TShiftState);
  private
    { Private declarations }
  public
    { Public declarations }
  end;

var
  Form2: TForm2;

implementation

uses main;
{$R *.dfm}

procedure TForm2.FormCreate(Sender: TObject);
begin
   with form1 do
   if rozmer<>0 then rozmeredit.Value:=rozmer;
end;

procedure TForm2.rozmerEditKeyDown(Sender: TObject; var Key: Word;
  Shift: TShiftState);
begin
  case key of
  13:okbtn.Click;
  27:cancelbtn.Click;
  end;
end;

end.
