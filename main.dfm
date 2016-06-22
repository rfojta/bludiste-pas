object Form1: TForm1
  Left = 199
  Top = 117
  BorderStyle = bsSingle
  Caption = 'Bludi'#353't'#283
  ClientHeight = 329
  ClientWidth = 535
  Color = clBtnFace
  Font.Charset = DEFAULT_CHARSET
  Font.Color = clWindowText
  Font.Height = -11
  Font.Name = 'MS Sans Serif'
  Font.Style = []
  Menu = MainMenu1
  OldCreateOrder = False
  OnCreate = FormCreate
  OnDestroy = FormDestroy
  OnMouseDown = FormMouseDown
  OnMouseMove = FormMouseMove
  OnPaint = FormPaint
  OnShow = FormShow
  PixelsPerInch = 96
  TextHeight = 13
  object StatusBar1: TStatusBar
    Left = 0
    Top = 310
    Width = 535
    Height = 19
    Panels = <
      item
        Text = 'F2 proj'#237't, F4 generovat, F5 um'#237'stit Minotaura jinam'
        Width = 50
      end>
    SimplePanel = False
  end
  object MainMenu1: TMainMenu
    Left = 16
    Top = 16
    object Projt1: TMenuItem
      AutoCheck = True
      Caption = '&Proj'#237't'
      HelpContext = 1
      Hint = 'Najde minotaura'
      ShortCut = 113
      OnClick = Projt1Click
    end
    object ukoncit1: TMenuItem
      Caption = 'Ukon'#269'it pr'#367'chod'
      Enabled = False
      ShortCut = 121
      Visible = False
      OnClick = ukoncit1Click
    end
    object Generovat1: TMenuItem
      Caption = 'Labyrint'
      object Generovat2: TMenuItem
        Caption = 'Generovat'
        HelpContext = 1
        Hint = 'Generuje bludiste nahodne'
        ShortCut = 115
        OnClick = Generovat1Click
      end
      object Prehoditminotaura1: TMenuItem
        Caption = 'P'#345'ehodit minotaura'
        ShortCut = 116
        OnClick = Prehoditminotaura1Click
      end
      object Vyprazdnitbludiste1: TMenuItem
        Caption = 'Vypr'#225'zdnit bludi'#353't'#283
        OnClick = Vyprazdnitbludiste1Click
      end
      object N1: TMenuItem
        Caption = '-'
      end
      object openlab: TMenuItem
        Caption = 'Na'#269#237'st bludi'#353't'#283
        OnClick = openlabClick
      end
      object savelab: TMenuItem
        Caption = 'Ulo'#382'it bludi'#353't'#283
        OnClick = savelabClick
      end
    end
    object Barvy1: TMenuItem
      Caption = 'Barvy'
      object Zdi1: TMenuItem
        Caption = 'Zdi'
        OnClick = Zdi1Click
      end
      object Cestatam1: TMenuItem
        Caption = 'Spr'#225'vn'#233' kroky'
        OnClick = Cestatam1Click
      end
      object Cestazpet1: TMenuItem
        Caption = #352'patn'#233' kroky'
        OnClick = Cestazpet1Click
      end
      object Minotaurus1: TMenuItem
        Caption = 'Minotaurus'
        object Obrys1: TMenuItem
          Caption = 'Obrys'
          OnClick = Obrys1Click
        end
        object Vnitrek1: TMenuItem
          Caption = 'Vnit'#345'ek'
          OnClick = Vnitrek1Click
        end
      end
    end
    object Konec1: TMenuItem
      Caption = 'Konec'
      OnClick = Konec1Click
    end
  end
  object barvy: TColorDialog
    Ctl3D = True
    Left = 144
    Top = 16
  end
  object Timer1: TTimer
    Enabled = False
    Interval = 30
    OnTimer = Timer1Timer
    Left = 80
    Top = 16
  end
  object opendi: TOpenDialog
    DefaultExt = '*.dat'
    Filter = 'Datove soubory (*.dat)|*.dat|Vsechny soubory (*.*)|*.*'
    Left = 80
    Top = 72
  end
  object savedi: TSaveDialog
    DefaultExt = '*.dat'
    FileName = 'bludiste.dat'
    Filter = 'Datove soubory (*.dat)|*.dat|Vsechny soubory (*.*)|*.*'
    Left = 16
    Top = 72
  end
end
