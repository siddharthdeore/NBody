var particles = [];
var cx,cy;

var zoom=0.4;
var offset={'x':0,'y':0};


var gui;
var Mass = 10;
var Walls = false;
var Collision = false;
var Kill = true;
var MassType = ['Positive','Negative'];
var Opration = ['Add','Drag'];


function clearAll() {
	particles=[];
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	cx=windowWidth/2;
	cy=windowHeight/2;
	button = createButton('Clear');
	button.position(52, 0);
	button.mousePressed(clearAll);
	stroke(255);
	for (var i = 5; i >= 0; i--) {
		var p=new Particle(random(windowWidth/zoom),random(windowHeight/zoom),0,0,0,0,random(20,30),1);
		particles.push(p);
	}

	  // Create the GUI
	  gui = createGui('Setting',0,0);
	  sliderRange(10, 10000, 10);
	  gui.addGlobals('Mass','MassType','Walls','Kill','Collision','Opration');
	  sliderRange(0.1, 2, 0.05);
	  gui.addGlobals('zoom');
	  gui.toggleCollapsed();
	}
	function draw() {
		background(0,40,100);
		push();
		scale(zoom);
		translate(offset.x,offset.y);
		calcNewton();
		for (var i = particles.length - 1; i >= 0; i--) {
			particles[i].render();
			particles[i].update();
		}
		pop();
		textSize(12);
		fill(255);
		text('Zoom:'+zoom+' Particles:' + particles.length,20,windowHeight-20);

		if(mouseIsPressed)line(mouseX,mouseY,mux,muy);
		cx=mouseX;cy=mouseY;

	}
	var mux,muy
	function mousePressed(){
		mux=mouseX;
		muy=mouseY;
	}
	function mouseReleased() {

		if (mux>150 && keyCode!=CONTROL) {
			var theta=-Math.atan2(mouseY-muy,mouseX-mux);
			var d= dist(mouseX,mouseY,mux,muy);
			var vx=-Math.cos(theta)*d/10;
			var vy=Math.sin(theta)*d/10;
			if(Opration==='Add'){
				if (MassType=='Positive') {
					particles.push(new Particle((mux/zoom-offset.x) ,(muy/zoom-offset.y),vx,vy,0,0,Mass,1))
				}else{
					particles.push(new Particle((mux/zoom -offset.x),(muy/zoom-offset.y),vx,vy,0,0,Mass,-1))
				}
			}
		}
		mux=mouseX;
		muy=mouseY;

	}
	function keyPressed() {
		if (keyCode === UP_ARROW) {
			zoom *= 2;
		}
		else if (keyCode === DOWN_ARROW) {
			zoom *= 0.5;
		}
	}

	function mouseDragged() {
		if(Opration==='Drag'){
			offset.x += mouseX-pmouseX;
			offset.y += mouseY-pmouseY;
		}
	}

	function Particle(x,y,vx,vy,ax,ay,mass,MassSign){
		this.x=x;
		this.y=y;
		this.vx=vx;
		this.vy=vy;
		this.ax=ax;
		this.ay=ay;
		this.mass=mass;
		this.MassSign=MassSign;
		this.r=Math.log(Math.abs(mass));
		this.myColor=this.MassSign>0?color(255,255,255,128):color(12,12,12,128);

		this.render = function(){
			fill(this.myColor);
			stroke(this.myColor)
			ellipse(this.x,this.y,this.r*4);
		}

	}

	Particle.prototype.updateAcc = function(ax,ay) {
		this.ax=ax*0.5;
		this.ay=ay*0.5;
	}; 
	Particle.prototype.update = function() {
		this.vx+=this.ax;
		this.vy+=this.ay;
		this.x+=this.vx;
		this.y+=this.vy;
		this.myColor=this.MassSign>0?color(255,255,255,12+Math.log(this.mass)*8):color(12,12,12,12+Math.log(this.mass)*8);	}; 


	function calcNewton() {
		var pnum=particles.length;
		for (var i = pnum - 1; i >= 0; i--) {
			var bodyA=particles[i];
			var sum_ax=0,sum_ay=0;
			for (var j = pnum - 1; j >= 0; j--) {
				if(i!=j){
					var bodyB=particles[j];
					var d=dist(bodyA.x,bodyA.y,bodyB.x,bodyB.y);
					var dx=bodyB.x-bodyA.x;
					var dy=bodyB.y-bodyA.y;
					if(d>(bodyA.r+bodyB.r)){
					sum_ax += bodyA.MassSign/bodyB.MassSign*bodyB.mass*dx/(d*d*d); //Sum of GM*X/r*r*r
					sum_ay += bodyA.MassSign/bodyB.MassSign*bodyB.mass*dy/(d*d*d); //Sum of GM*Y/r*r*r					
				}
				//if((d>(bodyA.r+bodyB.r) && d <10)){
				if(d <= (bodyA.r+bodyB.r)+5 && i!=particles.length-1 && Collision){
					var netMass=bodyA.mass+bodyB.mass;
					var temp=new Particle((bodyA.x*bodyA.mass+bodyB.x*bodyB.mass)/netMass, (bodyA.y* bodyA.mass + bodyB.y * bodyB.mass) / netMass, (bodyA.vx * bodyA.mass + bodyB.vx * bodyB.mass) / netMass, (bodyA.vy * bodyA.mass + bodyB.vy * bodyB.mass)/netMass,0,0,netMass,bodyA.MassSign);
					particles[i]=temp;
					particles.splice(j,1);
					pnum=particles.length;
					//sum_ax += -bodyB.mass*dx/(d*d*d); // For repulsion when bodies are too close
					//sum_ay += -bodyB.mass*dy/(d*d*d); //
				}
			}
		}


			r1=dist(bodyA.x,bodyA.y,0,bodyA.y); // repelent wall
			r2=dist(bodyA.x,bodyA.y,bodyA.x,0); // repelent wall
			r3=dist(bodyA.x,bodyA.y,windowWidth/zoom,bodyA.y); // repelent wall
			r4=dist(bodyA.x,bodyA.y,bodyA.x,windowHeight/zoom); // repelent wall

			if(Walls){
				sum_ax+= -10000*(0-bodyA.x)/(r1*r1*r1);
				sum_ay+= -10000*(0-bodyA.y)/(r2*r2*r2);
				sum_ax+= -10000*(windowWidth/zoom-bodyA.x)/(r3*r3*r3);
				sum_ay+= -10000*(windowHeight/zoom-bodyA.y)/(r4*r4*r4);
			}

			if (particles.length>0) {
				particles[i].updateAcc(sum_ax,sum_ay);				
			}

			if(Kill && (bodyA.x<0 || bodyA.y<0||bodyA.x>windowWidth/zoom || bodyA.y>windowHeight/zoom))
			{
				particles.splice(i,1);
				pnum--;
			}
		}
	}

// dynamically adjust the canvas to the window
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}
